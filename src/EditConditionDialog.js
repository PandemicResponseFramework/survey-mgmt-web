import React from 'react';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, FormGroup, FormControl, InputLabel, Select, MenuItem, IconButton} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {QuestionTypes} from './Constants';
import CancelIcon from '@material-ui/icons/Cancel';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import Axios from 'axios';

const useStyles = makeStyles((theme) => ({
  form2: {
    margin: theme.spacing(1),
    minWidth: 440,
  },
  groupCenter: {
    alignItems: 'center',
  },
  actionButton: {
    margin: theme.spacing(1),
  },
}));

export default function EditConditionDialog({question, callbackHandleClose}) {

  const classes = useStyles();

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
        newDependsOn = Object.assign([], conditionData.choiceDependsOn, {[index]: event.target.value});
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
      <DialogContentText></DialogContentText>

      {conditionData.type === QuestionTypes.BOOL &&
        <FormGroup row>
          <FormControl variant="outlined" className={classes.form2}>
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
        </FormGroup>
      }
      {conditionData.type === QuestionTypes.CHOICE &&
        <FormGroup>
          {conditionData.choiceDependsOn.map((answerId, index) => (
            <FormGroup key={index} row className={classes.groupCenter}>
              <FormControl variant="outlined" className={classes.form2}>
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
              <IconButton size="medium" color="secondary" aria-label="delete" className={classes.actionButton} onClick={() => onDeleteChoiceAnswer(index)}>
                <DeleteIcon />
              </IconButton>
              <span>{index+1 < question.answers.length && 'OR'}</span>
            </FormGroup>
          ))}
          {conditionData.choiceDependsOn.length < question.answers.length &&
            <FormGroup row>
              <FormControl variant="outlined" className={classes.form2}>
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
            </FormGroup>    
          }
        </FormGroup>
      }
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
    </Dialog>
  );
}