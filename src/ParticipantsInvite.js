import { Typography } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import React from 'react';

const useStyles = makeStyles((theme) => ({
}));

export default function InviteParticipants() {

  const classes = useStyles();
  const theme = useTheme();

  return (
    <Typography>InviteParticipants</Typography>
  );
}