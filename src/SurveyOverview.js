import { Box, Button, Fade, Grid, LinearProgress, IconButton, Tooltip, Paper, TableContainer, Table, TableRow, TableHead, TableBody, TableCell } from '@mui/material';
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
import { styled } from '@mui/material/styles';

const Root = styled("div")`
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: space-between;
`;
const Fader = styled(Fade)`
  margin-top: 10px;
`;
const TableButton = styled(IconButton)`
  margin: 0;
  padding: 0;
`;
const TableGrid = styled(Grid)`
  & .MuiGrid-item {
    padding-top: 0;
    margin-top: 0;
    margin-bottom: 0;
  };
  margin: 0;
`;

export default function SurveyOverview({callback}) {

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

  return (
    <Root>
      {surveyMetaDialogSetup &&
        <EditSurveyMetaDataDialog callbackHandleClose={onCreateSurvey}/>
      }

      <div>
        <Button
          variant="contained"
          color="primary"
          disabled={false}
          startIcon={<AddIcon />}
          onClick={() => onCreateSurvey(true)}>
          New Survey
        </Button>
      </div>

      <div>
        <Fader in={loadingState.delay != null}>
          <LinearProgress />
        </Fader>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>NameId</TableCell>
                <TableCell>Depends On</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Interval Start</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((data) => (
                <TableRow
                  key={data.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">{data.nameId}</TableCell>
                  <TableCell>{data.dependsOn}</TableCell>
                  <TableCell>
                    {data.releaseStatus === 'RELEASED'
                      ? <Box color="success.main" style={{ fontWeight: 'bold' }}>{data.releaseStatus}</Box>
                      : <Box color="warning.light" style={{ fontWeight: 'bold' }}>{data.releaseStatus}</Box>
                      }
                  </TableCell>
                  <TableCell>{data.version + 1}</TableCell>
                  <TableCell>
                    {data.releaseStatus === 'RELEASED' && (data.intervalStart == null || new Date(data.intervalStart).getTime() <= Date.now())
                      ? <Box color="success.main" style={{ fontWeight: 'bold' }}>YES</Box>
                      : <Box color="warning.light" style={{ fontWeight: 'bold' }}>NO</Box>
                    }
                  </TableCell>
                  <TableCell>{data.intervalStart ? format(new Date(data.intervalStart), 'dd-MM-yyyy HH:mm O') : 'NONE'}</TableCell>
                  <TableCell>
                    <TableGrid container spacing={1}>
                      <Grid item xs={4}>
                        {data.releaseStatus === 'RELEASED' && !data.editable && data.isLatestRelease &&
                          <Tooltip title="New version">
                            <TableButton size="medium" color="primary" aria-label="new-release" onClick={() => onCreateNewVersion(data.id)}>
                              <NewReleasesIcon />
                            </TableButton>
                          </Tooltip>
                        }
                        {data.releaseStatus !== 'RELEASED' &&
                          <Tooltip title="Edit survey">
                            <TableButton size="medium" color="primary" aria-label="edit" onClick={(event) => callback({view: ManagementViewTypes.SURVEY_EDIT, surveyId: data.id})}>
                              <EditIcon />
                            </TableButton>
                          </Tooltip>
                        }
                      </Grid>
                      <Grid item xs={4}>
                        <Tooltip title="View survey">
                          <TableButton size="medium" color="primary" aria-label="view" disabled={true}>
                            <VisibilityIcon />
                          </TableButton>
                        </Tooltip>
                      </Grid>
                      <Grid item xs={4}>
                        {data.releaseStatus !== 'RELEASED' &&
                          <Tooltip title="Delete survey">
                            <TableButton size="medium" color="secondary" aria-label="edit">
                              <DeleteIcon />
                            </TableButton>
                          </Tooltip>
                        }
                      </Grid>
                    </TableGrid>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </Root>
  );
}