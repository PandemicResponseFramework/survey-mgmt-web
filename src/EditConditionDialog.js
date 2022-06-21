import React, { Fragment } from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, InputLabel, Select, MenuItem, IconButton, Stack, Grid, FormControl } from '@mui/material';
import { QuestionTypes } from './Constants';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import Axios from 'axios';

export default function EditConditionDialog({ question, callbackHandleClose }) {

  const title = question.container == null ? 'Add Condition' : 'Edit Condition';

  const [conditionData, setConditionData] = React.useState({
    type: question.type,
    boolDependsOn: question.container == null ? true : question.container.boolDependsOn,
    choiceDependsOn: question.container == null || question.container.choiceDependsOn == null || question.container.choiceDependsOn.length === 0 ? [] : question.container.choiceDependsOn,
  });

  const onChangeDependsOn = (event, index) => {
    if (conditionData.type === QuestionTypes.BOOL) {
      setConditionData({
        ...conditionData,
        boolDependsOn: event.target.value,
      });
    } else if (conditionData.type === QuestionTypes.CHOICE) {

      let newDependsOn = null;
      if (index !== null) {
        newDependsOn = Object.assign([], conditionData.choiceDependsOn, { [index]: event.target.value });
      } else {
        newDependsOn = [...conditionData.choiceDependsOn];
        newDependsOn.push(event.target.value);
      }

      setConditionData({
        ...conditionData,
        choiceDependsOn: newDependsOn,
      });
    }
  };

  const onDeleteChoiceAnswer = (index) => {
    const newDependsOn = conditionData.choiceDependsOn.slice();
    newDependsOn.splice(index, 1);
    setConditionData({
      ...conditionData,
      choiceDependsOn: newDependsOn,
    });
  };

  const validateAndSave = () => {
    if (validate())
      save();
  };

  const validate = () => {

    let validationFailed = false;
    // TODO
    return !validationFailed;
  };

  const save = () => {

    const path = question.container == null ? '/manage/question/' + question.id + '/container' : '/manage/container/' + question.container.id;

    Axios.post(path, conditionData).then(function (response) {
      callbackHandleClose(true, response.data);
    }).catch(function (error) {
      // do nothing
    });
  };

  return (
    <Dialog open={true} maxWidth="sm" fullWidth={true} onClose={() => callbackHandleClose()} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} style={{ paddingTop: 10 }} alignItems="center">
          {conditionData.type === QuestionTypes.BOOL &&
            <Fragment>
              <Grid item xs={9}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel id="dependson-label">Answer</InputLabel>
                  <Select
                    labelId="dependson-label"
                    id="dependson"
                    value={conditionData.boolDependsOn}
                    onChange={(event) => onChangeDependsOn(event, null)}
                    label="Answer"
                    fullWidth={true}
                  >
                    <MenuItem value={true}>Yes</MenuItem>
                    <MenuItem value={false}>No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={3} />
            </Fragment>
          }
          {conditionData.type === QuestionTypes.CHOICE &&
            <Fragment>
              {conditionData.choiceDependsOn.map((answerId, index) => (
                <Fragment>
                  <Grid item xs={9}>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel id="dependson-{index}-label">Answer</InputLabel>
                      <Select
                        key={index}
                        labelId="dependson-{index}-label"
                        id="dependson-{index}"
                        value={answerId}
                        onChange={(event) => onChangeDependsOn(event, index)}
                        label="Answer"
                        fullWidth={true}
                      >
                        {question.answers.filter(element => element.id === answerId || !conditionData.choiceDependsOn.some(id => id === element.id)).map(element => (
                          <MenuItem key={element.id} value={element.id}>{element.value}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton size="medium" color="error" aria-label="delete" onClick={() => onDeleteChoiceAnswer(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                  <Grid item xs={2}>
                    {index + 1 < question.answers.length && <span>OR</span>}
                  </Grid>
                </Fragment>
              ))}
              {conditionData.choiceDependsOn.length < question.answers.length &&
                <Fragment>
                  <Grid item xs={9}>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel id="dependson-add-label">Answer</InputLabel>
                      <Select
                        labelId="dependson-add-label"
                        id="dependson-add"
                        onChange={(event) => onChangeDependsOn(event, null)}
                        label="Answer"
                        fullWidth={true}
                        value={-1}
                      >
                        <MenuItem value={-1}><em>Add an answer</em></MenuItem>
                        {question.answers.filter(element => !conditionData.choiceDependsOn.some(id => id === element.id)).map(element => (
                          <MenuItem key={element.id} value={element.id}>{element.value}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={3} />
                </Fragment>
              }
            </Fragment>
          }
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="secondary"
          disabled={false}
          startIcon={<CancelIcon />}
          onClick={() => callbackHandleClose()}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={false}
          startIcon={<SaveIcon />}
          onClick={validateAndSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog >
  );
}