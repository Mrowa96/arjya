import { Slider as BaseSlider } from '@base-ui/react/slider';

import styles from './Slider.module.css';

type Props = {
  value: number;
  min?: number;
  max?: number;
  onValueChange: (value: number) => void;
};

export function Slider({ value, min, max, onValueChange }: Props) {
  return (
    <BaseSlider.Root
      className={styles.root}
      defaultValue={0}
      value={value}
      min={min}
      max={max}
      onValueChange={onValueChange}
    >
      <BaseSlider.Control className={styles.control}>
        <BaseSlider.Track className={styles.track}>
          <BaseSlider.Indicator className={styles.indicator} />
          <BaseSlider.Thumb className={styles.thumb} />
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}
