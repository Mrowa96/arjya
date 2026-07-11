import { useCallback } from 'react';

import { RiDeleteBinLine } from '@remixicon/react';
import { useNavigate } from 'react-router';

import { useDeletePodcast } from '../../../hooks/api/useDeletePodcast';
import { Button } from '../../../ui/Button/Button';
import Dialog from '../../../ui/Dialog/Dialog';
import { Text } from '../../../ui/Text/Text';

import styles from './DeletePodcastDialog.module.css';

type Props = {
  podcastId: string;
  podcastName: string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export default function DeletePodcastDialog({ podcastId, podcastName, isOpen, setIsOpen }: Props) {
  const { mutateAsync: deletePodcast, isPending: isDeletePodcastPending } = useDeletePodcast();
  const navigate = useNavigate();

  const deleteButtonClickHandler = useCallback(async () => {
    await deletePodcast(podcastId);

    navigate('/', { replace: true });
  }, [podcastId, deletePodcast, navigate]);

  return (
    <Dialog title="Delete podcast" isOpen={isOpen} setIsOpen={setIsOpen}>
      <Text>
        Are you sure you want to delete podcast "
        <Text as="span" isBolder>
          {podcastName}
        </Text>
        "?
      </Text>

      <div className={styles.buttonWrapper}>
        <Button
          icon={<RiDeleteBinLine />}
          label="Delete"
          onClick={deleteButtonClickHandler}
          variant="danger"
          isLoading={isDeletePodcastPending}
        />
      </div>
    </Dialog>
  );
}
