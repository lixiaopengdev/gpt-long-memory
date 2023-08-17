import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Avatar, Button, Paper, Typography, Container, TextField } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { AUTH } from '../../constants/actionTypes';
import useStyles from './styles';
import jwt_decode from "jwt-decode";

const SignUp = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const classes = useStyles();

  const googleSuccess = async (email) => {

    // 将原来的逻辑移到此处，使用输入的邮箱作为参数
    const result = {
      email: email,
      familyName: email,
      givenName: email,
      id: email,
      picture: email,
      name: email,
    };

    const token = email;

    try {
      dispatch({ type: AUTH, data: { result, token } });
      const response = await fetch(`${import.meta.env.VITE_IP_PORT}/api/oauth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: result
        })
      });
      navigate('/');
      window.location.reload();
    } catch (error) {
      return alert("45 There was an error while processing your request. Please try to refresh the page, if the error persists clear the chat and/or the cache.")
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      googleSuccess(email);
    }
  };

  const handleInputChange = (event) => {
    setEmail(event.target.value);
  };

  return (
    <Container component="main"  className='h-screen'>
      <Paper className={classes.paper} elevation={3}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">{isSignup ? 'Sign up' : 'Sign in'}</Typography>
        <TextField
          value={email}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          label="UserName"
          fullWidth
        />
        <Button
          className={classes.googleButton}
          color="primary"
          fullWidth
          onClick={() => googleSuccess(email)}
          variant="contained"
        >
          Sign In
        </Button>
      </Paper>
    </Container>
  );
};

export default SignUp;
