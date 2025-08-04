"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/apiClient';
import { AxiosError } from 'axios';

interface SSOProviderFormProps {
  onSubmit: (data: SSOProviderData) => Promise<void>;
  initialData?: SSOProviderData;
  isLoading?: boolean;
}

interface SSOProviderData {
  provider: string;
  name: string;
  metadataUrl: string;
  clientId: string;
  clientSecret: string;
  status: boolean;
  providerMetadata?: any;
  validationStatus?: string;
  testResults?: any;
}

const SSO_PROVIDERS = [
  { value: 'saml', label: 'SAML 2.0', description: 'Security Assertion Markup Language' },
  { value: 'oidc', label: 'OpenID Connect', description: 'OpenID Connect protocol' },
  { value: 'oauth2', label: 'OAuth 2.0', description: 'OAuth 2.0 authorization framework' },
  { value: 'azure_ad', label: 'Azure AD', description: 'Microsoft Azure Active Directory' },
  { value: 'google', label: 'Google', description: 'Google Workspace / Gmail' },
  { value: 'okta', label: 'Okta', description: 'Okta Identity Platform' },
  { value: 'auth0', label: 'Auth0', description: 'Auth0 Identity Platform' },
];

export const SSOProviderForm = ({ onSubmit, initialData, isLoading }: SSOProviderFormProps) => {
  const { toast } = useToast();
  const [selectedProvider, setSelectedProvider] = useState(initialData?.provider || '');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SSOProviderData>({
    defaultValues: initialData || {
      provider: '',
      name: '',
      metadataUrl: '',
      clientId: '',
      clientSecret: '',
      status: true,
    }
  });

  const watchedProvider = watch('provider');
  const watchedMetadataUrl = watch('metadataUrl');

  useEffect(() => {
    setSelectedProvider(watchedProvider);
  }, [watchedProvider]);

  const validateProvider = async () => {
    if (!watchedMetadataUrl || !selectedProvider) return;

    setIsValidating(true);
    try {
      const response = await apiClient.post('/sso/validate', {
        provider: selectedProvider,
        metadataUrl: watchedMetadataUrl,
      });

      setValidationResult({ status: 'success', data: response.data.data });
      toast({
        title: "Validation Successful",
        description: "SSO provider configuration is valid",
      });
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const errorMessage = axiosError.response?.data?.error || 'Network error';
      setValidationResult({ status: 'error', error: errorMessage });
      toast({
        title: "Validation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const renderProviderSpecificFields = () => {
    switch (selectedProvider) {
      case 'saml':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="metadataUrl">SAML Metadata URL *</Label>
              <Input
                id="metadataUrl"
                {...register('metadataUrl', { 
                  required: 'Metadata URL is required for SAML',
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'Must be a valid URL'
                  }
                })}
                placeholder="https://your-idp.com/metadata"
              />
              {errors.metadataUrl && (
                <p className="text-sm text-red-500 mt-1">{errors.metadataUrl.message}</p>
              )}
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={validateProvider}
              disabled={isValidating || !watchedMetadataUrl}
            >
              {isValidating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                'Validate SAML Metadata'
              )}
            </Button>
          </div>
        );

      case 'oidc':
      case 'azure_ad':
      case 'google':
      case 'okta':
      case 'auth0':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="metadataUrl">Issuer URL *</Label>
              <Input
                id="metadataUrl"
                {...register('metadataUrl', { 
                  required: 'Issuer URL is required for OIDC',
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'Must be a valid URL'
                  }
                })}
                placeholder="https://your-provider.com"
              />
              {errors.metadataUrl && (
                <p className="text-sm text-red-500 mt-1">{errors.metadataUrl.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="clientId">Client ID *</Label>
              <Input
                id="clientId"
                {...register('clientId', { required: 'Client ID is required' })}
                placeholder="your-client-id"
              />
              {errors.clientId && (
                <p className="text-sm text-red-500 mt-1">{errors.clientId.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="clientSecret">Client Secret *</Label>
              <Input
                id="clientSecret"
                type="password"
                {...register('clientSecret', { required: 'Client Secret is required' })}
                placeholder="your-client-secret"
              />
              {errors.clientSecret && (
                <p className="text-sm text-red-500 mt-1">{errors.clientSecret.message}</p>
              )}
            </div>

            <Button 
              type="button" 
              variant="outline" 
              onClick={validateProvider}
              disabled={isValidating || !watchedMetadataUrl}
            >
              {isValidating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                'Validate OIDC Configuration'
              )}
            </Button>
          </div>
        );

      case 'oauth2':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="clientId">Client ID *</Label>
              <Input
                id="clientId"
                {...register('clientId', { required: 'Client ID is required' })}
                placeholder="your-client-id"
              />
              {errors.clientId && (
                <p className="text-sm text-red-500 mt-1">{errors.clientId.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="clientSecret">Client Secret *</Label>
              <Input
                id="clientSecret"
                type="password"
                {...register('clientSecret', { required: 'Client Secret is required' })}
                placeholder="your-client-secret"
              />
              {errors.clientSecret && (
                <p className="text-sm text-red-500 mt-1">{errors.clientSecret.message}</p>
              )}
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                OAuth2 requires manual configuration of authorization and token endpoints.
                Please contact support for assistance.
              </AlertDescription>
            </Alert>
          </div>
        );

      default:
        return null;
    }
  };

  const renderValidationResult = () => {
    if (!validationResult) return null;

    if (validationResult.status === 'success') {
      return (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Provider configuration validated successfully!
            {validationResult.data?.entityId && (
              <div className="mt-2">
                <strong>Entity ID:</strong> {validationResult.data.entityId}
              </div>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          Validation failed: {validationResult.error}
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>SSO Provider Configuration</CardTitle>
        <CardDescription>
          Configure Single Sign-On provider for your tenant
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="name">Provider Name *</Label>
            <Input
              id="name"
              {...register('name', { required: 'Provider name is required' })}
              placeholder="My SSO Provider"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="provider">Provider Type *</Label>
            <Select 
              value={selectedProvider} 
              onValueChange={(value: string) => {
                setValue('provider', value);
                setValidationResult(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select SSO provider type" />
              </SelectTrigger>
              <SelectContent>
                {SSO_PROVIDERS.map((provider) => (
                  <SelectItem key={provider.value} value={provider.value}>
                    <div>
                      <div className="font-medium">{provider.label}</div>
                      <div className="text-sm text-gray-500">{provider.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.provider && (
              <p className="text-sm text-red-500 mt-1">{errors.provider.message}</p>
            )}
          </div>

          {selectedProvider && (
            <Tabs defaultValue="configuration" className="w-full">
              <TabsList>
                <TabsTrigger value="configuration">Configuration</TabsTrigger>
                <TabsTrigger value="testing">Testing</TabsTrigger>
              </TabsList>
              
              <TabsContent value="configuration" className="space-y-4">
                {renderProviderSpecificFields()}
                {renderValidationResult()}
              </TabsContent>
              
              <TabsContent value="testing" className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Testing functionality will be available after the provider is configured and saved.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="status"
              {...register('status')}
              className="rounded border-gray-300"
            />
            <Label htmlFor="status">Enable this SSO provider</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || isValidating}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Provider'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
