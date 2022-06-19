//import DataBrowser, { getObjectPropertyByString } from '@alekna/react-data-browser';
import { Box, Button, Fade, Grid, LinearProgress, IconButton, Tooltip } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import DeleteIcon from '@mui/icons-material/Delete';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Axios from 'axios';
import React, { useEffect } from 'react';
import { useInterval } from './Utils';
import {ReleaseStatusTypes, ManagementViewTypes} from './Constants';
import EditSurveyMetaDataDialog from './EditSurveyMetaDataDialog';
import { format } from 'date-fns';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    justifyContent: 'space-between',
  },
  loading: {
    marginTop: 10,
  },
  button: {
    flexGrow: 1,
  },
  action: {
    width: '100%',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'none',
    width: '100%',
  },
  head: {
    display: 'flex',
    flex: '0 0 auto',
    height: 46,
    color: 'black',
    borderBottom: '1px solid #ccc',
    padding: '0 5px',
  },
  head_row: {
    display: 'flex',
    flex: '1 1 auto',
    textTransform: 'uppercase',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  head_row_item: {
    display: 'flex',
    textTransform: 'uppercase',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    overflowX: 'auto',
    padding: '0 5px',
  },
  body_row: {
    display: 'flex',
    flex: '0 0 auto',
    borderBottom: '1px solid #eee',
  },
  body_row_item: {
    display: 'flex',
    height: 46,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '0 10px',
    fontSize: '14px',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  }
}));

export default function SurveyOverview({callback}) {

  const { classes } = useStyles();

  const [loadingState, setLoadingState] = React.useState({
    data: [],
    delay: 500,
  });

  const [surveyMetaDialogSetup, setSurveyMetaDialogSetup] = React.useState(false);

  useInterval(() => {

    Axios.get('/manage/survey').then(function (response) {
      setLoadingState({
        ...loadingState,
        data: response.data,
        delay: null,
      });
    }).catch(function (error) {
      if (loadingState) {
        setLoadingState({
          ...loadingState,
          delay: null,
        });
      }
    });
  }, loadingState == null ? null : loadingState.delay);

  useEffect(() => {

    return function cleanup() {
      setLoadingState({
        ...loadingState,
        delay: null,
      })
    };
  }, []);

  const prepare = () => {
    if (!loadingState.data || loadingState.data.length === 0)
      return [];

    const result = [...loadingState.data];
    
    result.forEach(element => {
      
      let highestReleasedVersion = -1;

      result.forEach(inner => {
        if (inner.nameId === element.nameId) {
          // There exists another version, which is in EDIT mode
          if (inner.releaseStatus === ReleaseStatusTypes.EDIT)
            element.editable = true;
          // Collect latest release version
          if (inner.releaseStatus === ReleaseStatusTypes.RELEASED && inner.version > highestReleasedVersion)
            highestReleasedVersion = inner.version;
        } 
      });

      if (element.releaseStatus === ReleaseStatusTypes.RELEASED && element.version === highestReleasedVersion)
        element.isLatestRelease = true;
      else
        element.isLatestRelease = false;
    });

    return result;
  }

  const data = prepare();

  console.log(data);

  const onCreateNewVersion = (surveyId) => {
    Axios.post('/manage/survey/' + surveyId + '/version')
    .then(function (response) {
      setLoadingState({
        ...loadingState,
        delay: 500,
      });
    }).catch(function (error) {
      // do nothing
    });
  };

  const onCreateSurvey = (show, gotEdited) => {
    setSurveyMetaDialogSetup(show === true);

    if (gotEdited)
      setLoadingState({
        ...loadingState,
        delay: 500,
      })
  };

  const columns = [
    { label: 'NameId', sortField: 'nameId', isLocked: true },
    { label: 'Depends On', sortField: 'dependsOn', isLocked: true },
    { label: 'Status', sortField: 'releaseStatus', isLocked: true },
    { label: 'Version', sortField: 'version', isLocked: true },
    { label: 'Active', sortField: 'active', isLocked: true},
    { label: 'Interval Start', sortField: 'intervalStart', isLocked: true},
    { label: 'Actions', sortField: 'actions', isLocked: true },
  ];

  function fieldReducer(fieldValue, fieldName, data) {
    switch (fieldName) {
      case 'releaseStatus':
        return (
          fieldValue === 'RELEASED'
            ? <Box color="success.main" style={{ fontWeight: 'bold' }}>{fieldValue}</Box>
            : <Box color="warning.light" style={{ fontWeight: 'bold' }}>{fieldValue}</Box>
        );
      case 'intervalStart':
        return (
          fieldValue ? format(new Date(fieldValue), 'dd-MM-yyyy HH:mm O') : 'NONE'
        );
      case 'active':
        return (
          data.releaseStatus === 'RELEASED' && (data.intervalStart == null || new Date(data.intervalStart).getTime() <= Date.now())
            ? <Box color="success.main" style={{ fontWeight: 'bold' }}>YES</Box>
            : <Box color="warning.light" style={{ fontWeight: 'bold' }}>NO</Box>
        );
      case 'actions':
        return (
          <Grid container spacing={1} className={classes.container}>
            <Grid item xs={4}>
              {data.releaseStatus === 'RELEASED' && !data.editable && data.isLatestRelease &&
                <Tooltip title="New version">
                  <IconButton size="medium" color="primary" aria-label="new-release" onClick={() => onCreateNewVersion(data.id)}>
                    <NewReleasesIcon />
                  </IconButton>
                </Tooltip>
              }
              {data.releaseStatus !== 'RELEASED' &&
                <Tooltip title="Edit survey">
                  <IconButton size="medium" color="primary" aria-label="edit" onClick={(event) => callback({view: ManagementViewTypes.SURVEY_EDIT, surveyId: data.id})}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              }
            </Grid>
            <Grid item xs={4}>
              <Tooltip title="View survey">
                <IconButton size="medium" color="primary" aria-label="view" disabled={true}>
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item xs={4}>
              {data.releaseStatus !== 'RELEASED' &&
                <Tooltip title="Delete survey">
                  <IconButton size="medium" color="secondary" aria-label="edit">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              }
            </Grid>
          </Grid>
        );
      case 'version':
        return fieldValue + 1;
      default:
        return fieldValue;
    }
  }

  return (
    <div className={classes.root}>
      
      {surveyMetaDialogSetup &&
        <EditSurveyMetaDataDialog callbackHandleClose={onCreateSurvey}/>
      }

      <div>
        <Button
          variant="contained"
          color="primary"
          disabled={false}
          startIcon={<AddIcon />}
          className={classes.button}
          onClick={() => onCreateSurvey(true)}>
          New Survey
        </Button>
      </div>

      <div className={classes.overview}>

        <Fade in={loadingState.delay != null} className={classes.loading}>
          <LinearProgress />
        </Fade>

        {/* <div className={classes.tableContainer}>
          <DataBrowser
            initialColumnFlex={['0 0 15%', '0 0 15%', '0 0 10%', '0 0 10%', '0 0 10%', '0 0 20%', '0 0 20%']}
            columns={columns}
          >
            {
              ({ columnFlex, visibleColumns }) => (
                <div className={classes.table}>
                  <div className={classes.head}>
                    <div className={classes.head_row}>
                      {visibleColumns.map((cell, index) => (
                        <div
                          key={index}
                          className={classes.head_row_item}
                          style={{ flex: columnFlex[index] }}
                        >
                          {cell.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={classes.body}>
                    {data.map((row, key) => (
                      <div key={key} className={classes.body_row}>
                        {visibleColumns.map(({ label, sortField }, index) => (
                          <div
                            key={sortField}
                            className={classes.body_row_item}
                            style={{ flex: columnFlex[index] }}
                          >
                            {
                              fieldReducer(getObjectPropertyByString(row, sortField), sortField, row)
                            }
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )
            }
          </DataBrowser>
        </div> */}
      </div>
    </div>
  );
}