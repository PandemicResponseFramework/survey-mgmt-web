import { Typography } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';

const useStyles = makeStyles((theme) => ({
    timer: {
        display: 'flex',
        alignItems: 'center',
    }
}));

export default function Timer(props) {

    const classes = useStyles();
    const theme = useTheme();
    const step = 1000;

    const calculateTimeLeft = () => {

        const difference = (timeLeft == null) ? props.timeout : timeLeft.value - step;

        let result = {};

        if (difference > 0) {
            result = {
                display: {
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                },
                value: difference
            };
        }

        return result;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, step);
    });

    const timerComponents = [];

    Object.keys(timeLeft.display).forEach(interval => {

        var stringValue = new String(timeLeft.display[interval]);
        if (stringValue.length == 0)
            stringValue = "00";
        else if (stringValue.length == 1)
            stringValue = "0" + stringValue;

        timerComponents.push(
            <span key={interval}>
                {stringValue}{interval !== 'seconds' && ":"}
            </span>
        );
    });

    return (
        <div className={classes.timer}>
            <span style={{ marginRight: 10 }}>Timeout:</span>
            {timerComponents.length
                ? timerComponents
                : <span>{props.timeoutMessage == null
                    ? <span>Time is up!</span>
                    : props.timeoutMessage}</span>}
        </div>
    );
}