import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';

import { useLocation, useNavigate } from 'react-router';

import { Button } from '../../ui/Button/Button';
import Dialog from '../../ui/Dialog/Dialog';
import { Text } from '../../ui/Text/Text';
import { useToast } from '../../ui/Toast/Toast';
import { getApiClient } from '../../utils/api';

import styles from './NetworkStateProvider.module.css';

const NetworkStateContext = createContext({
  isOffline: !window.navigator.onLine,
});

const TIMER_INTERVAL = 5000;
const TIMER_TIMEOUT = 3000;

type Props = {
  children: ReactNode;
  enableChecks?: boolean;
};

export function NetworkStateProvider({ children, enableChecks = true }: Props) {
  const [isOffline, setIsOffline] = useState(!window.navigator.onLine);
  const [isDialogOpen, setIsDialogOpen] = useState(isOffline);
  const wasOfflineRef = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const requestResolved = useEffectEvent(() => {
    setIsOffline(false);
    setIsDialogOpen(false);

    if (wasOfflineRef.current) {
      addToast({ message: 'Network connection restored.', type: 'info' });
    }
  });

  const requestRejected = useEffectEvent(() => {
    setIsOffline(true);

    if (location.pathname !== '/offline-episodes') {
      setIsDialogOpen(true);
    } else {
      if (!wasOfflineRef.current) {
        addToast({ message: 'Network connection lost.', type: 'info' });
      }
    }
  });

  useEffect(() => {
    if (!enableChecks) {
      return;
    }

    let timer: number | undefined;

    const timerFn = () => {
      const abortController = new AbortController();
      let isPromiseSettled = false;

      getApiClient()
        .status.statusList({
          signal: abortController.signal,
        })
        .then(() => {
          isPromiseSettled = true;
          requestResolved();
        })
        .catch(() => {
          isPromiseSettled = true;
          requestRejected();
        });

      setTimeout(() => {
        if (!isPromiseSettled) {
          abortController.abort('Timeout reached');
        }
      }, TIMER_TIMEOUT);

      timer = window.setTimeout(timerFn, TIMER_INTERVAL);
    };

    timerFn();

    return () => {
      window.clearInterval(timer);
    };
  }, [enableChecks]);

  useEffect(() => {
    wasOfflineRef.current = isOffline;
  }, [isOffline]);

  const switchButtonClickHandler = () => {
    navigate('/offline-episodes');
    setIsDialogOpen(false);
  };

  return (
    <NetworkStateContext value={{ isOffline }}>
      {children}
      <Dialog
        title="Network issue detected"
        isOpen={isDialogOpen}
        setIsOpen={() => undefined}
        disableCloseButton
      >
        <div className={styles.content}>
          <Text>You are not connected to any network or your connection is too slow.</Text>
          <Text>
            App can be used in offline mode, where you can listen to podcast episodes you downloaded
            beforehand.
          </Text>

          <div className={styles.buttonWrapper}>
            <Button label="Switch to offline mode" onClick={switchButtonClickHandler} />
          </div>
        </div>
      </Dialog>
    </NetworkStateContext>
  );
}

export function useNetworkState() {
  return useContext(NetworkStateContext);
}
