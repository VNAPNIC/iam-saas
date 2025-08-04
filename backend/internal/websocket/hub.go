package websocket

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// Hub maintains the set of active clients and broadcasts messages to the clients
type Hub struct {
	// Registered clients by tenant ID
	clients map[string]map[*Client]bool

	// Inbound messages from the clients
	broadcast chan []byte

	// Register requests from the clients
	register chan *Client

	// Unregister requests from clients
	unregister chan *Client

	// Mutex for thread-safe operations
	mutex sync.RWMutex

	// Connection metrics
	messageCount    int64
}

// Client is a middleman between the websocket connection and the hub
type Client struct {
	hub *Hub

	// The websocket connection
	conn *websocket.Conn

	// Buffered channel of outbound messages
	send chan []byte

	// Client metadata
	tenantID string
	userID   string
	role     string
}

// Message represents a websocket message
type Message struct {
	Type      string      `json:"type"`
	TenantID  string      `json:"tenant_id,omitempty"`
	UserID    string      `json:"user_id,omitempty"`
	Data      interface{} `json:"data"`
	Timestamp time.Time   `json:"timestamp"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// Allow connections from any origin in development
		// In production, implement proper origin checking
		return true
	},
}

// NewHub creates a new Hub
func NewHub() *Hub {
	return &Hub{
		clients:    make(map[string]map[*Client]bool),
		broadcast:  make(chan []byte, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

// Run starts the hub
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mutex.Lock()
			if h.clients[client.tenantID] == nil {
				h.clients[client.tenantID] = make(map[*Client]bool)
			}
			h.clients[client.tenantID][client] = true
			h.mutex.Unlock()
			
			log.Printf("Client connected: tenant=%s, user=%s", client.tenantID, client.userID)
			
			// Send welcome message
			welcome := Message{
				Type:      "CONNECTED",
				Data:      map[string]string{"status": "connected"},
				Timestamp: time.Now(),
			}
			if data, err := json.Marshal(welcome); err == nil {
				select {
				case client.send <- data:
				default:
					close(client.send)
					delete(h.clients[client.tenantID], client)
				}
			}

		case client := <-h.unregister:
			h.mutex.Lock()
			if clients, ok := h.clients[client.tenantID]; ok {
				if _, ok := clients[client]; ok {
					delete(clients, client)
					close(client.send)
					if len(clients) == 0 {
						delete(h.clients, client.tenantID)
					}
				}
			}
			h.mutex.Unlock()
			
			log.Printf("Client disconnected: tenant=%s, user=%s", client.tenantID, client.userID)

		case message := <-h.broadcast:
			var msg Message
			if err := json.Unmarshal(message, &msg); err != nil {
				log.Printf("Error unmarshaling message: %v", err)
				continue
			}
			
			h.broadcastToTenant(msg.TenantID, message)
		}
	}
}

// BroadcastToTenant sends a message to all clients of a specific tenant
func (h *Hub) BroadcastToTenant(tenantID string, messageType string, data interface{}) {
	message := Message{
		Type:      messageType,
		TenantID:  tenantID,
		Data:      data,
		Timestamp: time.Now(),
	}
	
	if messageData, err := json.Marshal(message); err == nil {
		h.broadcast <- messageData
	}
}

// BroadcastToUser sends a message to a specific user
func (h *Hub) BroadcastToUser(tenantID, userID string, messageType string, data interface{}) {
	message := Message{
		Type:      messageType,
		TenantID:  tenantID,
		UserID:    userID,
		Data:      data,
		Timestamp: time.Now(),
	}
	
	if messageData, err := json.Marshal(message); err == nil {
		h.mutex.RLock()
		if clients, ok := h.clients[tenantID]; ok {
			for client := range clients {
				if client.userID == userID {
					select {
					case client.send <- messageData:
					default:
						close(client.send)
						delete(clients, client)
					}
				}
			}
		}
		h.mutex.RUnlock()
	}
}

// broadcastToTenant sends message to all clients of a tenant
func (h *Hub) broadcastToTenant(tenantID string, message []byte) {
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	
	if clients, ok := h.clients[tenantID]; ok {
		for client := range clients {
			select {
			case client.send <- message:
			default:
				close(client.send)
				delete(clients, client)
			}
		}
	}
}

// GetActiveClients returns the number of active clients for a tenant
func (h *Hub) GetActiveClients(tenantID string) int {
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	
	if clients, ok := h.clients[tenantID]; ok {
		return len(clients)
	}
	return 0
}

// HandleWebSocket handles websocket connections
func (h *Hub) HandleWebSocket(c *gin.Context) {
	// Extract tenant and user info from JWT or query params
	tenantID := c.Query("tenant_id")
	userID := c.Query("user_id")
	role := c.Query("role")
	
	if tenantID == "" || userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tenant_id and user_id required"})
		return
	}
	
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}
	
	client := &Client{
		hub:      h,
		conn:     conn,
		send:     make(chan []byte, 256),
		tenantID: tenantID,
		userID:   userID,
		role:     role,
	}
	
	client.hub.register <- client
	
	// Allow collection of memory referenced by the caller by doing all work in new goroutines
	go client.writePump()
	go client.readPump()
}

const (
	// Time allowed to write a message to the peer
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer
	maxMessageSize = 512
)

// readPump pumps messages from the websocket connection to the hub
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	
	c.conn.SetReadLimit(maxMessageSize)
	_ = c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		_ = c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})
	
	for {
		_, _, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}
	}
}

// writePump pumps messages from the hub to the websocket connection
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	
	for {
		select {
		case message, ok := <-c.send:
			_ = c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				_ = c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			
			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			_, _ = w.Write(message)
			
			// Add queued messages to the current websocket message
			n := len(c.send)
			for i := 0; i < n; i++ {
				_, _ = w.Write([]byte{'\n'})
				_, _ = w.Write(<-c.send)
			}
			
			if err := w.Close(); err != nil {
				return
			}
			
		case <-ticker.C:
			_ = c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}



// GetConnectionCount returns the total number of active connections
func (h *Hub) GetConnectionCount() int {
	h.mutex.RLock()
	defer h.mutex.RUnlock()

	count := 0
	for _, clients := range h.clients {
		count += len(clients)
	}
	return count
}

// GetTenantConnectionCount returns the number of connections for a specific tenant
func (h *Hub) GetTenantConnectionCount(tenantID string) int {
	h.mutex.RLock()
	defer h.mutex.RUnlock()

	if clients, exists := h.clients[tenantID]; exists {
		return len(clients)
	}
	return 0
}

// GetConnectionMetrics returns detailed connection metrics
func (h *Hub) GetConnectionMetrics() *ConnectionMetrics {
	h.mutex.RLock()
	defer h.mutex.RUnlock()

	tenantCounts := make(map[string]int)
	totalConnections := 0

	for tenantID, clients := range h.clients {
		count := len(clients)
		tenantCounts[tenantID] = count
		totalConnections += count
	}

	return &ConnectionMetrics{
		TotalConnections: totalConnections,
		TenantCounts:     tenantCounts,
		MessageCount:     h.messageCount,
		Timestamp:        time.Now(),
	}
}

// ConnectionMetrics holds WebSocket connection metrics
type ConnectionMetrics struct {
	TotalConnections int            `json:"total_connections"`
	TenantCounts     map[string]int `json:"tenant_counts"`
	MessageCount     int64          `json:"message_count"`
	Timestamp        time.Time      `json:"timestamp"`
}

// BroadcastSystemMessage sends a system-wide message to all connected clients
func (h *Hub) BroadcastSystemMessage(messageType string, data interface{}) {
	h.mutex.RLock()
	defer h.mutex.RUnlock()

	message := Message{
		Type:      messageType,
		Data:      data,
		Timestamp: time.Now(),
	}

	messageBytes, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling system message: %v", err)
		return
	}

	for _, clients := range h.clients {
		for client := range clients {
			select {
			case client.send <- messageBytes:
				h.messageCount++
			default:
				// Client's send channel is full, close it
				close(client.send)
				delete(clients, client)
			}
		}
	}
}

// DisconnectTenantClients disconnects all clients for a specific tenant
func (h *Hub) DisconnectTenantClients(tenantID string, reason string) {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	if clients, exists := h.clients[tenantID]; exists {
		// Send disconnect message first
		message := Message{
			Type: "DISCONNECT",
			Data: map[string]interface{}{
				"reason": reason,
			},
			Timestamp: time.Now(),
		}

		messageBytes, _ := json.Marshal(message)

		for client := range clients {
			// Send disconnect message
			select {
			case client.send <- messageBytes:
			default:
			}
			
			// Close the connection
			close(client.send)
			client.conn.Close()
		}

		// Clear all clients for this tenant
		delete(h.clients, tenantID)
	}
}