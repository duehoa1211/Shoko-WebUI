import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Redirect, Switch } from 'react-router';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import Sidebar from '../../components/Layout/Sidebar';

import DashboardPage from '../dashboard/DashboardPage';
import ImportFoldersPage from '../import-folders/ImportFoldersPage';
import ActionsPage from '../actions/ActionsPage';
import SettingsPage from '../settings/SettingsPage';
import LogsPage from '../logs/LogsPage';

import ImportFolderModal from '../../components/Dialogs/ImportFolderModal';
import LanguagesModal from '../../components/Dialogs/LanguagesModal';
import ProfileModal from '../../components/Dialogs/ProfileModal';
import CollectionPage from '../collection/CollectionPage';
import NoMatchPage from '../nomatch';

function MainPage() {
  const dispatch = useDispatch();

  const toastPosition = useSelector(
    (state: RootState) => state.webuiSettings.webui_v2.toastPosition,
  );
  const notifications = useSelector(
    (state: RootState) => state.webuiSettings.webui_v2.notifications,
  );

  useEffect(() => {
    dispatch({ type: Events.SETTINGS_GET_SERVER });
    dispatch({ type: Events.MAINPAGE_LOAD });
    dispatch({ type: Events.MAINPAGE_QUEUE_STATUS });
  }, []);

  return (
    <React.Fragment>
      {notifications && (
        <ToastContainer
          position={toastPosition}
          autoClose={4000}
          transition={Slide}
          bodyClassName="font-semibold font-open-sans"
          className="mt-20"
        />
      )}
      <div className="flex grow h-full">
        <ImportFolderModal />
        <LanguagesModal />
        <ProfileModal />
        <div className="flex">
          <Sidebar />
        </div>
        <div className="flex flex-col grow">
          <div className="overflow-y-auto grow">
            <Switch>
              <Route exact path="/">
                <Redirect to="/dashboard" />
              </Route>
              <Route exact path="/dashboard" component={DashboardPage} />
              <Route exact path="/import-folders" component={ImportFoldersPage} />
              <Route exact path="/actions" component={ActionsPage} />
              <Route exact path="/log" component={LogsPage} />
              <Route exact path="/collection" component={CollectionPage} />
              <Route exact path="/settings" component={SettingsPage} />
              <Route component={NoMatchPage} />
            </Switch>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default MainPage;