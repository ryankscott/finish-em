import { useState } from 'react';
import CloudSyncSignIn from './CloudSyncSignIn';
import CloudSyncSignUp from './CloudSyncSignUp';

const CloudSyncSignUpOrIn = ({ onClose }: { onClose: () => void }) => {
  const [mode, setMode] = useState<'signup' | 'signin'>('signin');
  return (
    <>
      {mode === 'signin' ? (
        <CloudSyncSignIn setMode={(mode) => setMode(mode)} onClose={onClose} />
      ) : (
        <CloudSyncSignUp setMode={(mode) => setMode(mode)} onClose={onClose} />
      )}
    </>
  );
};

export default CloudSyncSignUpOrIn;
