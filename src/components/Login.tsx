import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/context';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, login, register } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegister) {
      if (!name.trim()) {
        setError(t('auth.nameRequired'));
        return;
      }
      const result = await register(email, password, name);
      if (!result.success) {
        setError(result.error || t('errors.saveError'));
      } else {
        navigate('/');
      }
    } else {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || t('errors.saveError'));
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 dark:from-purple-900 dark:via-indigo-900 dark:to-indigo-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">
            {isRegister ? t('auth.signup') : t('auth.login')}
          </CardTitle>
          <CardDescription className="text-center">
            {isRegister ? t('auth.createAccount') : t('auth.enterAccount')}
          </CardDescription>
        </CardHeader>
        <CardContent>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="name">{t('auth.name')}</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('auth.name')}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg">
              {isRegister ? t('auth.signup') : t('auth.login')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-sm"
            >
              {isRegister
                ? `${t('auth.hasAccount')} ${t('auth.login')}`
                : `${t('auth.noAccount')} ${t('auth.signup')}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
