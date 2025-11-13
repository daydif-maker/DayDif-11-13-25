import React from 'react';
import { Screen } from '@ui';
import { EmptyState } from '@ui';
import { useUserStateStore } from '@store';

export const ErrorScreen: React.FC = () => {
  const { error, setError } = useUserStateStore();

  const handleRetry = () => {
    setError(null);
    // TODO: Retry the failed operation (e.g., load lessons, generate content)
  };

  return (
    <Screen>
      <EmptyState
        heading="Something Went Wrong"
        description={error || 'An unexpected error occurred. Please try again.'}
        icon="alert-circle-outline"
        actionLabel="Retry"
        onAction={handleRetry}
      />
    </Screen>
  );
};

