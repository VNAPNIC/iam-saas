package entities

import "encoding/xml"

// SAMLMetadata represents SAML metadata structure
type SAMLMetadata struct {
	XMLName          xml.Name         `xml:"EntityDescriptor"`
	EntityID         string           `xml:"entityID,attr"`
	IDPSSODescriptor IDPSSODescriptor `xml:"IDPSSODescriptor"`
}

// IDPSSODescriptor represents SAML IDP SSO descriptor
type IDPSSODescriptor struct {
	SingleSignOnService []SingleSignOnService `xml:"SingleSignOnService"`
	KeyDescriptor       []KeyDescriptor       `xml:"KeyDescriptor"`
}

// SingleSignOnService represents SAML SSO service
type SingleSignOnService struct {
	Binding  string `xml:"Binding,attr"`
	Location string `xml:"Location,attr"`
}

// KeyDescriptor represents SAML key descriptor
type KeyDescriptor struct {
	Use     string  `xml:"use,attr"`
	KeyInfo KeyInfo `xml:"KeyInfo"`
}

// KeyInfo represents SAML key info
type KeyInfo struct {
	X509Data X509Data `xml:"X509Data"`
}

// X509Data represents SAML X509 data
type X509Data struct {
	X509Certificate string `xml:"X509Certificate"`
}