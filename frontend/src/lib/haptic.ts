/**
 * Module utilitaire pour le retour haptique tactile (Android / PWA)
 * Utilise la Vibration API native (navigator.vibrate) avec tolérance de panne totale.
 */

/**
 * Vérifie si la vibration tactile est supportée par le terminal
 */
export const isHapticSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    'vibrate' in navigator &&
    typeof navigator.vibrate === 'function'
  );
};

/**
 * Déclenche un motif de vibration personnalisé
 */
export const triggerHaptic = (pattern: number | number[]): boolean => {
  try {
    if (isHapticSupported()) {
      return navigator.vibrate(pattern);
    }
  } catch (err) {
    // Évite tout crash sur les navigateurs stricts ou environnements sans permission
    console.debug('[Haptic] Vibration désactivée ou non permise:', err);
  }
  return false;
};

/**
 * Retour tactile doux lors de l'auto-remplissage automatique par SMS
 * Double impulsion dynamique et rapide (35ms ON, 45ms OFF, 35ms ON)
 */
export const hapticAutoFill = (): boolean => {
  return triggerHaptic([35, 45, 35]);
};

/**
 * Retour tactile de succès transactionnel / confirmation de paiement
 * Impulsion cyber affirmée (40ms ON, 60ms OFF, 120ms ON)
 */
export const hapticSuccess = (): boolean => {
  return triggerHaptic([40, 60, 120]);
};

/**
 * Retour tactile d'erreur / code invalide / paiement refusé
 * Triple vibration d'alerte (100ms, 50ms, 100ms, 50ms, 100ms)
 */
export const hapticError = (): boolean => {
  return triggerHaptic([100, 50, 100, 50, 100]);
};

/**
 * Retour tactile léger lors de la saisie manuelle d'un chiffre
 * Micro-clic de 20ms
 */
export const hapticSelection = (): boolean => {
  return triggerHaptic(20);
};

/**
 * Retour tactile d'alerte ou délai d'expiration proche
 */
export const hapticWarning = (): boolean => {
  return triggerHaptic([70, 40, 70]);
};
