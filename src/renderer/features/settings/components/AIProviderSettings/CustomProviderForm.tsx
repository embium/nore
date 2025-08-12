import React, { useState, useCallback, useEffect } from 'react';
import type { CustomProviderConfig } from '@/types/ai';
import { createCustomProviderConfig } from '@/types/ai';
import {
  addCustomProvider,
  updateProviderConfig,
  isProviderIdAvailable,
  generateUniqueProviderId,
} from '../../state/aiSettings/aiProviders/providerConfigs';

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X } from 'lucide-react';
import { Badge } from '@/src/renderer/components/ui/badge';

interface CustomProviderFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  initialData?: CustomProviderConfig;
  onSave: (config: CustomProviderConfig) => void;
  onCancel: () => void;
}

export const CustomProviderForm: React.FC<CustomProviderFormProps> = ({
  isOpen,
  setIsOpen,
  initialData,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    id: initialData?.id || '',
    name: initialData?.name || '',
    apiHost: initialData?.apiHost || '',
    apiKey: initialData?.apiKey || '',
    description: initialData?.description || '',
    providerType: initialData?.providerType || ('openai-compatible' as const),
    headers: initialData?.headers || {},
    modelPath: initialData?.modelPath || '',
    supportedFeatures: {
      streaming: initialData?.supportedFeatures?.streaming ?? true,
      toolUse: initialData?.supportedFeatures?.toolUse ?? false,
      vision: initialData?.supportedFeatures?.vision ?? false,
      imageGeneration: initialData?.supportedFeatures?.imageGeneration ?? false,
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customHeaders, setCustomHeaders] = useState<
    Array<{ key: string; value: string }>
  >(() => {
    if (initialData?.headers) {
      return Object.entries(initialData.headers).map(([key, value]) => ({
        key,
        value,
      }));
    }
    return [{ key: '', value: '' }];
  });

  // Sync form state from initialData when dialog opens for editing or initialData changes
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        id: initialData.id || '',
        name: initialData.name || '',
        apiHost: initialData.apiHost || '',
        apiKey: initialData.apiKey || '',
        description: initialData.description || '',
        providerType:
          initialData.providerType || ('openai-compatible' as const),
        headers: initialData.headers || {},
        modelPath: initialData.modelPath || '',
        supportedFeatures: {
          streaming: initialData.supportedFeatures?.streaming ?? true,
          toolUse: initialData.supportedFeatures?.toolUse ?? false,
          vision: initialData.supportedFeatures?.vision ?? false,
          imageGeneration:
            initialData.supportedFeatures?.imageGeneration ?? false,
        },
      });

      setCustomHeaders(
        initialData.headers && Object.keys(initialData.headers).length > 0
          ? Object.entries(initialData.headers).map(([key, value]) => ({
              key,
              value,
            }))
          : [{ key: '', value: '' }]
      );

      setErrors({});
    }
  }, [isOpen, initialData]);

  const isEditing = Boolean(initialData);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.apiHost.trim()) {
      newErrors.apiHost = 'API Host is required';
    } else {
      try {
        new URL(formData.apiHost);
      } catch {
        newErrors.apiHost = 'API Host must be a valid URL';
      }
    }

    if (!isEditing) {
      const proposedId = formData.id || generateUniqueProviderId(formData.name);
      if (!isProviderIdAvailable(proposedId)) {
        newErrors.id = 'Provider ID already exists';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isEditing]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      const id = isEditing
        ? formData.id
        : formData.id || generateUniqueProviderId(formData.name);

      // Convert headers array back to object
      const headers = customHeaders
        .filter((h) => h.key.trim() && h.value.trim())
        .reduce(
          (acc, { key, value }) => {
            acc[key.trim()] = value.trim();
            return acc;
          },
          {} as Record<string, string>
        );

      const config = isEditing
        ? { ...initialData!, ...formData, headers }
        : createCustomProviderConfig(id, formData.name, formData.apiHost, {
            ...formData,
            headers: Object.keys(headers).length > 0 ? headers : undefined,
          });

      onSave(config);
    },
    [formData, customHeaders, validateForm, isEditing, initialData, onSave]
  );

  const addHeaderField = useCallback(() => {
    setCustomHeaders((prev) => [...prev, { key: '', value: '' }]);
  }, []);

  const removeHeaderField = useCallback((index: number) => {
    setCustomHeaders((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateHeaderField = useCallback(
    (index: number, field: 'key' | 'value', value: string) => {
      setCustomHeaders((prev) =>
        prev.map((header, i) =>
          i === index ? { ...header, [field]: value } : header
        )
      );
    },
    []
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Custom Provider' : 'Add Custom Provider'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Edit the provider configuration settings'
              : 'Create a custom provider to connect to your own AI service or API'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Basic Information */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="provider-name"
              className="col-span-4"
            >
              Provider Name *
            </Label>
            <Input
              id="provider-name"
              className="col-span-4"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="My Custom Provider"
            />
            {errors.name && (
              <p className="text-destructive text-sm col-span-4 -mt-2">
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="provider-id"
              className="col-span-4"
            >
              Provider ID {!isEditing && '*'}
            </Label>
            <Input
              id="provider-id"
              className="col-span-4"
              value={formData.id}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, id: e.target.value }))
              }
              disabled={isEditing}
              placeholder="Auto-generated from name"
            />
            {errors.id && (
              <p className="text-destructive text-sm col-span-4 -mt-2">
                {errors.id}
              </p>
            )}
          </div>

          <Separator className="my-2" />

          {/* Connection Settings */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="api-host"
              className="col-span-4"
            >
              API Host *
            </Label>
            <Input
              id="api-host"
              className="col-span-4"
              type="url"
              value={formData.apiHost}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, apiHost: e.target.value }))
              }
              placeholder="https://api.example.com"
            />
            {errors.apiHost && (
              <p className="text-destructive text-sm col-span-4 -mt-2">
                {errors.apiHost}
              </p>
            )}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="api-key"
              className="col-span-4"
            >
              API Key
            </Label>
            <Input
              id="api-key"
              className="col-span-4"
              type="password"
              value={formData.apiKey}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, apiKey: e.target.value }))
              }
              placeholder="Optional API key"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="model-path"
              className="col-span-4"
            >
              Model Path (Optional)
            </Label>
            <Input
              id="model-path"
              className="col-span-4"
              value={formData.modelPath}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, modelPath: e.target.value }))
              }
              placeholder="v1/chat/completions"
            />
            <p className="text-sm text-muted-foreground col-span-4 -mt-2">
              Additional path to append to the API host for custom endpoints
            </p>
          </div>

          <Separator className="my-2" />

          {/* Provider Configuration */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="provider-type"
              className="col-span-4"
            >
              Provider Type
            </Label>
            <div className="col-span-4">
              <Badge variant="outline">OpenAI Compatible</Badge>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="description"
              className="col-span-4"
            >
              Description
            </Label>
            <Textarea
              id="description"
              className="col-span-4"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Brief description of this provider"
              rows={3}
            />
          </div>

          <Separator className="my-2" />

          {/* Custom Headers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Custom Headers</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addHeaderField}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Header
              </Button>
            </div>

            {customHeaders.map((header, index) => (
              <div
                key={index}
                className="grid grid-cols-5 gap-2 items-center"
              >
                <Input
                  value={header.key}
                  onChange={(e) =>
                    updateHeaderField(index, 'key', e.target.value)
                  }
                  placeholder="Header name"
                  className="col-span-2"
                />
                <Input
                  value={header.value}
                  onChange={(e) =>
                    updateHeaderField(index, 'value', e.target.value)
                  }
                  placeholder="Header value"
                  className="col-span-2"
                />
                {customHeaders.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHeaderField(index)}
                    className="col-span-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Separator className="my-2" />

          {/* Supported Features */}
          <div className="space-y-4">
            <Label>Supported Features</Label>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(formData.supportedFeatures).map(
                ([feature, enabled]) => (
                  <div
                    key={feature}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`feature-${feature}`}
                      checked={enabled}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          supportedFeatures: {
                            ...prev.supportedFeatures,
                            [feature]: checked === true,
                          },
                        }))
                      }
                    />
                    <Label
                      htmlFor={`feature-${feature}`}
                      className="text-sm font-normal capitalize"
                    >
                      {feature.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
          >
            {isEditing ? 'Update Provider' : 'Create Provider'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
