import React from 'react';
import { mdiCloseCircleOutline, mdiLoading, mdiMinusCircleOutline, mdiOpenInNew, mdiRefresh } from '@mdi/js';
import { Icon } from '@mdi/react';
import { countBy } from 'lodash';

import ShokoPanel from '@/components/Panels/ShokoPanel';
import toast from '@/components/Toast';
import TransitionDiv from '@/components/TransitionDiv';
import ItemCount from '@/components/Utilities/ItemCount';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import UtilitiesTable from '@/components/Utilities/UtilitiesTable';
import { invalidateQueries } from '@/core/react-query/queryClient';
import { useDeleteSeriesMutation } from '@/core/react-query/series/mutations';
import { useSeriesWithoutFilesInfiniteQuery } from '@/core/react-query/series/queries';
import { dayjs } from '@/core/util';
import useFlattenListResult from '@/hooks/useFlattenListResult';
import useRowSelection from '@/hooks/useRowSelection';

import type { UtilityHeaderType } from '@/components/Utilities/constants';
import type { SeriesType } from '@/core/types/api/series';
import type { Updater } from 'use-immer';

const columns: UtilityHeaderType<SeriesType>[] = [
  {
    id: 'id',
    name: 'AniDB ID',
    className: 'w-32',
    item: series => (
      <div className="flex justify-between">
        {series.IDs.AniDB}
        <a
          href={`https://anidb.net/anime/${series.IDs.AniDB}`}
          target="_blank"
          rel="noreferrer noopener"
          className="mr-6 cursor-pointer text-panel-text-primary"
          aria-label="Open AniDB series page"
        >
          <Icon path={mdiOpenInNew} size={1} />
        </a>
      </div>
    ),
  },
  {
    id: 'name',
    name: 'Name',
    className: 'line-clamp-2 grow basis-0 overflow-hidden',
    item: series => <div title={series.Name}>{series.Name}</div>,
  },
  {
    id: 'created',
    name: 'Date Added',
    className: 'w-64',
    item: series => dayjs(series.Created).format('MMMM DD YYYY, HH:mm'),
  },
];

const Menu = (props: { selectedRows: SeriesType[], setSelectedRows: Updater<Record<number, boolean>> }) => {
  const { selectedRows, setSelectedRows } = props;

  const { mutateAsync: deleteSeries } = useDeleteSeriesMutation();

  const handleDeleteSeries = () => {
    const promises = selectedRows.map(
      row => deleteSeries({ seriesId: row.IDs.ID, deleteFiles: false }),
    );

    Promise
      .allSettled(promises)
      .then((result) => {
        const failedCount = countBy(result, 'status').rejected;
        if (failedCount) toast.error(`Error deleting ${failedCount} series!`);
        if (failedCount !== selectedRows.length) toast.success(`${selectedRows.length} series deleted!`);
      })
      .catch(console.error);
  };

  return (
    <div className="relative box-border flex h-[3.25rem] grow items-center rounded-lg border border-panel-border bg-panel-background-alt px-4 py-3">
      <TransitionDiv className="absolute flex grow gap-x-4" show={selectedRows.length === 0}>
        <MenuButton
          onClick={() => {
            setSelectedRows([]);
            invalidateQueries(['series-without-files']);
          }}
          icon={mdiRefresh}
          name="Refresh"
        />
      </TransitionDiv>
      <TransitionDiv className="absolute flex grow gap-x-4" show={selectedRows.length !== 0}>
        <MenuButton onClick={() => handleDeleteSeries()} icon={mdiMinusCircleOutline} name="Delete" highlight />
        <MenuButton
          onClick={() => setSelectedRows([])}
          icon={mdiCloseCircleOutline}
          name="Cancel Selection"
          highlight
        />
      </TransitionDiv>
    </div>
  );
};

function SeriesWithoutFilesUtility() {
  const seriesQuery = useSeriesWithoutFilesInfiniteQuery({ pageSize: 25 });
  const [series, seriesCount] = useFlattenListResult(seriesQuery.data);

  const {
    handleRowSelect,
    rowSelection,
    selectedRows,
    setRowSelection,
  } = useRowSelection<SeriesType>(series);

  return (
    <div className="flex grow flex-col gap-y-6">
      <div>
        <ShokoPanel
          title="Series Without Files"
          options={<ItemCount count={seriesCount} selected={selectedRows?.length} />}
        >
          <div className="flex items-center gap-x-3">
            {/* Endpoint doesn't have search */}
            {/* <Input */}
            {/*   type="text" */}
            {/*   placeholder="Search..." */}
            {/*   startIcon={mdiMagnify} */}
            {/*   id="search" */}
            {/*   value="" */}
            {/*   onChange={() => {}} */}
            {/*   inputClassName="px-4 py-3" */}
            {/* /> */}
            <Menu selectedRows={selectedRows} setSelectedRows={setRowSelection} />
          </div>
        </ShokoPanel>
      </div>

      <div className="flex grow overflow-y-auto rounded-lg border border-panel-border bg-panel-background px-4 py-6">
        {seriesQuery.isPending && (
          <div className="flex grow items-center justify-center text-panel-text-primary">
            <Icon path={mdiLoading} size={4} spin />
          </div>
        )}

        {!seriesQuery.isPending && seriesCount === 0 && (
          <div className="flex grow items-center justify-center font-semibold">No series without files!</div>
        )}

        {seriesQuery.isSuccess && seriesCount > 0 && (
          <UtilitiesTable
            columns={columns}
            count={seriesCount}
            fetchNextPage={seriesQuery.fetchNextPage}
            handleRowSelect={handleRowSelect}
            isFetchingNextPage={seriesQuery.isFetchingNextPage}
            rows={series}
            rowSelection={rowSelection}
            setSelectedRows={setRowSelection}
            skipSort
          />
        )}
      </div>
    </div>
  );
}

export default SeriesWithoutFilesUtility;
