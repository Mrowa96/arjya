import { useSettings } from '../../../../features/settings/SettingsProvider';
import Dialog from '../../../../ui/Dialog/Dialog';
import { AddPodcastFromRssUrl } from './components/AddPodcastFromRssUrl/AddPodcastFromRssUrl';
import { AddPodcastFromSearch } from './components/AddPodcastFromSearch/AddPodcastFromSearch';

type Props = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export default function AddPodcastDialog({ isOpen, setIsOpen }: Props) {
  const { settings } = useSettings();

  return (
    <Dialog title="Add new podcast" isOpen={isOpen} setIsOpen={setIsOpen}>
      {settings.search.enabled ? (
        <AddPodcastFromSearch setIsOpen={setIsOpen} />
      ) : (
        <AddPodcastFromRssUrl setIsOpen={setIsOpen} />
      )}
    </Dialog>
  );
}
