import { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { FirebaseService } from '@/services/FirebaseService';

export const useTutorial = () => {
  const { user, isAuthenticated, userProfile } = useFirebaseAuth();
  const [showTutorial, setShowTutorial] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkTutorialStatus();
  }, [user, isAuthenticated, userProfile]);

  const checkTutorialStatus = async () => {
    try {
      if (!user || !isAuthenticated) {
        console.log('🎓 [Tutorial] No authenticated user, hiding tutorial');
        setShowTutorial(false);
        setLoading(false);
        return;
      }

      console.log(`🎓 [Tutorial] Checking tutorial status for user ${user.uid}`);
      setLoading(true);
      
      // Verificar no Firebase se o usuário já viu o tutorial
      const hasSeenTutorial = await FirebaseService.hasUserSeenTutorial(user.uid);
      
      if (hasSeenTutorial) {
        console.log(`🎓 [Tutorial] User ${user.uid} has already seen tutorial - NOT showing`);
        setShowTutorial(false);
      } else {
        console.log(`🎓 [Tutorial] User ${user.uid} has NOT seen tutorial - SHOWING tutorial`);
        setShowTutorial(true);
      }
    } catch (error) {
      console.error('❌ [Tutorial] Error checking tutorial status:', error);
      // Em caso de erro, não mostrar tutorial para evitar problemas
      setShowTutorial(false);
    } finally {
      setLoading(false);
    }
  };

  const completeTutorial = async () => {
    try {
      if (!user) {
        console.warn('⚠️ [Tutorial] No user found when trying to complete tutorial');
        return;
      }

      console.log(`🎓 [Tutorial] Marking tutorial as COMPLETED for user ${user.uid}`);
      
      // Marcar no Firebase que o usuário viu o tutorial
      await FirebaseService.markTutorialAsSeen(user.uid);
      
      // Atualizar estado local
      setShowTutorial(false);
      
      console.log(`✅ [Tutorial] Tutorial PERMANENTLY completed for user ${user.uid} - will NEVER show again`);
    } catch (error) {
      console.error('❌ [Tutorial] Error marking tutorial as completed:', error);
      // Mesmo com erro, esconder tutorial para não bloquear usuário
      setShowTutorial(false);
    }
  };

  const resetTutorial = async () => {
    try {
      if (!user) {
        console.warn('⚠️ [Tutorial] No user found when trying to reset tutorial');
        return;
      }

      console.log(`🔄 [Tutorial] Resetting tutorial for user ${user.uid}`);
      
      // Resetar no Firebase
      await FirebaseService.resetTutorialStatus(user.uid);
      
      // Mostrar tutorial novamente
      setShowTutorial(true);
      
      console.log(`✅ [Tutorial] Tutorial reset for user ${user.uid} - will show again`);
    } catch (error) {
      console.error('❌ [Tutorial] Error resetting tutorial:', error);
    }
  };

  const skipTutorial = async () => {
    console.log(`⏭️ [Tutorial] User skipped tutorial - marking as completed PERMANENTLY`);
    await completeTutorial();
  };

  return {
    showTutorial,
    loading,
    completeTutorial,
    resetTutorial,
    skipTutorial,
  };
};