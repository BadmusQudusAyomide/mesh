import { useState } from 'react';
import { apiService } from '../lib/api';
import { Button } from './ui/button';

const ApiTest = () => {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testHealthCheck = async () => {
    setLoading(true);
    try {
      const response = await apiService.healthCheck();
      setStatus(`✅ Health check successful: ${response.status}`);
    } catch (error) {
      setStatus(`❌ Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testRegister = async () => {
    setLoading(true);
    try {
      const response = await apiService.register({
        username: `testuser${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        fullName: 'Test User'
      });
      setStatus(`✅ Registration successful: ${response.user.username}`);
    } catch (error) {
      setStatus(`❌ Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">API Connection Test</h2>
      
      <div className="space-y-2">
        <Button 
          onClick={testHealthCheck} 
          disabled={loading}
          className="mr-2"
        >
          Test Health Check
        </Button>
        
        <Button 
          onClick={testRegister} 
          disabled={loading}
          variant="outline"
        >
          Test Registration
        </Button>
      </div>

      {status && (
        <div className={`p-3 rounded-lg ${
          status.includes('✅') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <p className="text-sm">{status}</p>
        </div>
      )}
    </div>
  );
};

export default ApiTest; 