import { defineCustomElements } from '@ionic/core/loader';

export const setupIonic = () => {
    if (typeof window !== 'undefined') {
        defineCustomElements(window);
    }
};