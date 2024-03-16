import React from 'react';
import Modal from 'react-modal';
import cx from 'classnames';

type Props = {
  children: React.ReactNode;
  fullHeight?: boolean;
  show: boolean;
  header?: React.ReactNode;
  subHeader?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  noPadding?: boolean;
  noGap?: boolean;
  className?: string;
  onRequestClose?: () => void;
  onAfterOpen?: () => void;
  notCloseOnEsc?: boolean;
  notCloseOnOverlayClick?: boolean;
  containerClassName?: string;
};

const sizeClass = {
  sm: 'w-[37.5rem]',
  md: 'w-[50rem]',
  lg: 'w-[62rem]',
};

function ModalPanel(props: Props) {
  const {
    children,
    className,
    containerClassName,
    fullHeight,
    header,
    noGap,
    noPadding,
    notCloseOnEsc,
    notCloseOnOverlayClick,
    onAfterOpen,
    onRequestClose,
    show,
    size,
    subHeader,
  } = props;

  Modal.setAppElement('#app-root');

  // const isSm = useMediaQuery({ minWidth: 0, maxWidth: 767 });

  return (
    <Modal
      isOpen={show}
      overlayClassName="fixed inset-0 bg-black/50 z-[80]"
      className={cx('mt-10 flex h-full items-center justify-center', containerClassName)}
      onAfterOpen={onAfterOpen}
      closeTimeoutMS={150}
      shouldCloseOnEsc={notCloseOnEsc !== true}
      shouldCloseOnOverlayClick={notCloseOnOverlayClick !== true}
    >
      <div
        className="flex size-full items-center justify-center"
        onClick={() => {
          if (notCloseOnOverlayClick) return;
          onRequestClose?.();
        }}
      >
        <div
          className={cx(
            'flex flex-col rounded-lg border border-panel-border bg-panel-background drop-shadow-lg',
            sizeClass[size ?? 'md'],
            !noPadding && ('gap-y-6'),
            fullHeight ? 'h-[66%]' : 'max-h-[66%]',
            className,
          )}
          onClick={e => e.stopPropagation()}
        >
          <div>
            {header && (
              <div className="rounded-t-lg border-b border-panel-border bg-panel-background-alt p-6 text-xl font-semibold">
                {header}
                {subHeader && <div className="mt-1 text-base">{subHeader}</div>}
              </div>
            )}
          </div>
          <div
            className={cx(
              'flex flex-col grow',
              !noGap && ('gap-y-6'),
              !noPadding && ('px-6 pb-8'),
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ModalPanel;
