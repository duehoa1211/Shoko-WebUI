import React, { useEffect, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useDispatch, useSelector } from 'react-redux';
import { mdiLoading, mdiMenuDown } from '@mdi/js';
import { Icon } from '@mdi/react';
import { produce } from 'immer';
import { useEffectOnce } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import toast from '@/components/Toast';
import { initialSettings } from '@/core/react-query/settings/helpers';
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { setLayoutEditMode } from '@/core/slices/mainpage';
import useEventCallback from '@/hooks/useEventCallback';

import CollectionStats from './panels/CollectionStats';
import ContinueWatching from './panels/ContinueWatching';
import ImportFolders from './panels/ImportFolders';
import MediaType from './panels/MediaType';
import NextUp from './panels/NextUp';
import QueueProcessor from './panels/QueueProcessor';
import RecentlyImported from './panels/RecentlyImported';
import RecommendedAnime from './panels/RecommendedAnime';
import ShokoNews from './panels/ShokoNews';
import UnrecognizedFiles from './panels/UnrecognizedFiles';
import UpcomingAnime from './panels/UpcomingAnime';

import type { RootState } from '@/core/store';
import type { LayoutType } from '@/core/types/api/settings';

const ResponsiveGridLayout = WidthProvider(Responsive);

const renderResizeHandle = () => (
  <div className="react-resizable-handle bottom-0 right-0 cursor-nwse-resize">
    <Icon path={mdiMenuDown} size={1.5} className="text-panel-text-primary" rotate={-45} />
  </div>
);

const Toast = (
  { cancelLayoutChange, currentLayout }: { cancelLayoutChange: () => void, currentLayout: LayoutType },
) => {
  const dispatch = useDispatch();

  const settingsQuery = useSettingsQuery();
  const settings = settingsQuery.data;
  const { mutate: patchSettings } = usePatchSettingsMutation();

  const saveLayout = useEventCallback(() => {
    const newSettings = produce(settings, (draftState) => {
      draftState.WebUI_Settings.layout.dashboard = currentLayout;
    });
    patchSettings({ newSettings }, {
      onSuccess: () => {
        dispatch(setLayoutEditMode(false));
        toast.dismiss('layoutEditMode');
        toast.success('Layout Saved!');
      },
      onError: error => toast.error('', error.message),
    });
  });

  const resetLayout = useEventCallback(() => {
    const newSettings = produce(settings, (draftState) => {
      draftState.WebUI_Settings.layout.dashboard = initialSettings.WebUI_Settings.layout.dashboard;
    });
    patchSettings({ newSettings }, {
      onSuccess: () => {
        dispatch(setLayoutEditMode(false));
        toast.dismiss('layoutEditMode');
        toast.success('Layout reset to default!');
      },
      onError: error => toast.error('', error.message),
    });
  });

  return (
    <div className="flex flex-col gap-y-3">
      Edit Mode Enabled
      <div className="flex items-center justify-end gap-x-3 font-semibold">
        <Button onClick={resetLayout} buttonType="danger" className="px-3 py-1.5">Reset to Default</Button>
        <Button onClick={cancelLayoutChange} buttonType="secondary" className="px-3 py-1.5">Cancel</Button>
        <Button onClick={saveLayout} buttonType="primary" className="px-3 py-1.5">Save</Button>
      </div>
    </div>
  );
};

function DashboardPage() {
  const dispatch = useDispatch();

  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const settingsQuery = useSettingsQuery();
  const settings = settingsQuery.data;

  const {
    combineContinueWatching,
    hideCollectionStats,
    hideContinueWatching,
    hideImportFolders,
    hideMediaType,
    hideNextUp,
    hideQueueProcessor,
    hideRecentlyImported,
    hideRecommendedAnime,
    hideShokoNews,
    hideUnrecognizedFiles,
    hideUpcomingAnime,
  } = settings.WebUI_Settings.dashboard;

  const [currentLayout, setCurrentLayout] = useState(
    settings.WebUI_Settings.layout.dashboard,
  );

  useEffect(() => {
    if (settingsQuery.isSuccess) setCurrentLayout(settings.WebUI_Settings.layout.dashboard);
  }, [settings, settingsQuery.isSuccess]);

  const cancelLayoutChange = useEventCallback(() => {
    setCurrentLayout(settings.WebUI_Settings.layout.dashboard);
    dispatch(setLayoutEditMode(false));
    toast.dismiss('layoutEditMode');
  });

  useEffect(() => {
    if (!layoutEditMode) {
      toast.dismiss('layoutEditMode');
      return;
    }

    toast.info(
      '',
      <Toast
        cancelLayoutChange={cancelLayoutChange}
        currentLayout={currentLayout}
      />,
      {
        autoClose: false,
        draggable: false,
        closeOnClick: false,
        toastId: 'layoutEditMode',
        className: 'max-w-[27.3rem] ml-auto',
      },
    );
  }, [layoutEditMode, currentLayout, cancelLayoutChange]);

  useEffectOnce(() => () => cancelLayoutChange());

  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [currentLayout]);

  if (!settingsQuery.isSuccess) {
    return (
      <div className="flex grow items-center justify-center text-panel-text-primary">
        <Icon path={mdiLoading} size={4} spin />
      </div>
    );
  }

  return (
    <ResponsiveGridLayout
      layouts={currentLayout}
      breakpoints={{ lg: 1024, md: 768, sm: 640 }} // These match tailwind breakpoints (for consistency)
      cols={{ lg: 12, md: 10, sm: 6 }}
      rowHeight={0}
      margin={[24, 24]}
      className="w-full"
      onLayoutChange={(_layout, layouts) => setCurrentLayout(layouts)}
      isDraggable={layoutEditMode}
      isResizable={layoutEditMode}
      resizeHandle={renderResizeHandle()}
      containerPadding={[0, 0]}
    >
      {!hideQueueProcessor && (
        <div key="queueProcessor">
          <QueueProcessor />
        </div>
      )}
      {!hideUnrecognizedFiles && (
        <div key="unrecognizedFiles">
          <UnrecognizedFiles />
        </div>
      )}
      {!hideRecentlyImported && (
        <div key="recentlyImported">
          <RecentlyImported />
        </div>
      )}
      {!hideCollectionStats && (
        <div key="collectionBreakdown">
          <CollectionStats />
        </div>
      )}
      {!hideMediaType && (
        <div key="collectionTypeBreakdown">
          <MediaType />
        </div>
      )}
      {!hideImportFolders && (
        <div key="importFolders">
          <ImportFolders />
        </div>
      )}
      {!hideShokoNews && (
        <div key="shokoNews">
          <ShokoNews />
        </div>
      )}
      {(!hideContinueWatching && !combineContinueWatching) && (
        <div key="continueWatching">
          <ContinueWatching />
        </div>
      )}
      {!hideNextUp && (
        <div key="nextUp">
          <NextUp />
        </div>
      )}
      {!hideUpcomingAnime && (
        <div key="upcomingAnime">
          <UpcomingAnime />
        </div>
      )}
      {!hideRecommendedAnime && (
        <div key="recommendedAnime">
          <RecommendedAnime />
        </div>
      )}
    </ResponsiveGridLayout>
  );
}

export default DashboardPage;
