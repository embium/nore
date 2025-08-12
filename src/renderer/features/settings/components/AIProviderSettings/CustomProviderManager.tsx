import React, { useState, useCallback } from 'react';
import { observer } from '@legendapp/state/react';
import type { CustomProviderConfig } from '@/types/ai';
import {
  getCustomProviders,
  removeCustomProvider,
  updateProviderConfig,
  addCustomProvider,
} from '../../state/aiSettings/aiProviders/providerConfigs';
import { CustomProviderForm } from './CustomProviderForm';

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, Edit, Trash2, X } from 'lucide-react';

interface CustomProviderManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomProviderManager: React.FC<CustomProviderManagerProps> =
  observer(({ isOpen, onClose }) => {
    const [showForm, setShowForm] = useState(false);
    const [editingProvider, setEditingProvider] =
      useState<CustomProviderConfig | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
      null
    );

    const customProviders = getCustomProviders();

    const handleAddProvider = useCallback(() => {
      setEditingProvider(null);
      setShowForm(true);
    }, []);

    const handleEditProvider = useCallback((provider: CustomProviderConfig) => {
      setEditingProvider(provider);
      setShowForm(true);
    }, []);

    const handleSaveProvider = useCallback(
      (config: CustomProviderConfig) => {
        if (editingProvider) {
          updateProviderConfig(config.id, {
            ...config,
            updatedAt: new Date().toISOString(),
          });
        } else {
          // Add new custom provider
          addCustomProvider(config);
        }
        setShowForm(false);
        setEditingProvider(null);
      },
      [editingProvider]
    );

    const handleDeleteProvider = useCallback((providerId: string) => {
      setShowDeleteConfirm(providerId);
    }, []);

    const confirmDelete = useCallback((providerId: string) => {
      removeCustomProvider(providerId);
      setShowDeleteConfirm(null);
    }, []);

    const cancelDelete = useCallback(() => {
      setShowDeleteConfirm(null);
    }, []);

    const handleCancel = useCallback(() => {
      setShowForm(false);
      setEditingProvider(null);
    }, []);

    return (
      <>
        <Dialog
          open={isOpen}
          onOpenChange={onClose}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Custom Providers
              </DialogTitle>
              <DialogDescription>
                Manage your custom AI providers and their configurations
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {customProviders.length === 0 ? (
                <div className="text-center py-12">
                  <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No custom providers configured
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                    Add custom providers to connect to your own AI services or
                    third-party APIs.
                  </p>
                  <Button onClick={handleAddProvider}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Provider
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      {customProviders.length} custom provider
                      {customProviders.length !== 1 ? 's' : ''} configured
                    </p>
                    <Button
                      onClick={handleAddProvider}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Provider
                    </Button>
                  </div>

                  {customProviders.map((provider) => (
                    <Card key={provider.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base">
                                {provider.name}
                              </CardTitle>
                              <Badge
                                variant={
                                  provider.enabled ? 'default' : 'secondary'
                                }
                              >
                                {provider.enabled ? 'Enabled' : 'Disabled'}
                              </Badge>
                              <Badge variant="outline">
                                {provider.providerType}
                              </Badge>
                            </div>
                            <CardDescription>
                              {provider.description}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditProvider(provider)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProvider(provider.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">API Host:</span>{' '}
                            {provider.apiHost}
                          </div>
                          <div>
                            <span className="font-medium">ID:</span>{' '}
                            {provider.id}
                          </div>
                          {provider.modelPath && (
                            <div>
                              <span className="font-medium">Model Path:</span>{' '}
                              {provider.modelPath}
                            </div>
                          )}
                          {provider.headers &&
                            Object.keys(provider.headers).length > 0 && (
                              <div>
                                <span className="font-medium">
                                  Custom Headers:
                                </span>{' '}
                                {Object.keys(provider.headers).length} header(s)
                              </div>
                            )}
                        </div>

                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">
                            Supported Features:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(
                              provider.supportedFeatures || {}
                            ).map(([feature, enabled]) => (
                              <Badge
                                key={feature}
                                variant={enabled ? 'default' : 'outline'}
                                className="text-xs"
                              >
                                {feature.replace(/([A-Z])/g, ' $1').trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={onClose}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Custom Provider Form Dialog */}
        <CustomProviderForm
          isOpen={showForm}
          setIsOpen={setShowForm}
          initialData={editingProvider || undefined}
          onSave={handleSaveProvider}
          onCancel={handleCancel}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={!!showDeleteConfirm}
          onOpenChange={() => setShowDeleteConfirm(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Custom Provider</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this custom provider? This
                action cannot be undone. All models associated with this
                provider will also be removed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={cancelDelete}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  showDeleteConfirm && confirmDelete(showDeleteConfirm)
                }
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  });
