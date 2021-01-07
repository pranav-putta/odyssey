import { uiActions } from './ui.slice';

module UIService {
  export const setProgress = (visible: boolean) => {
    return uiActions.progressChanged({ visible });
  };

  export const setError = (error: string) => {
    return uiActions.error({ error });
  };

  export const setCompleteState = () => {
    return uiActions.completed();
  };

  export const setStableState = () => {
    return uiActions.stable();
  };

  export const setServicesLoaded = () => {
    return uiActions.servicesLoaded();
  };
}

export default UIService;
