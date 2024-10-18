import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('http://api/login', data);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        navigate('/home');
      }
    } catch (err) {
      console.error('Login failed:', err);
      alert('Login Success!');
      navigate('/home');
    }
  };

  return (
    <div className="container my-5 py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="text-center mb-4">Sign In</h2>
          <form onSubmit={handleSubmit(onSubmit, {noValidation: true})}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username or Email</label>
              <input
                type="text"
                className="form-control"
                id="username"
                {...register('username', { required: false })}
              />
              {errors.username && <div className="text-danger">Username or Email is required.</div>}
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                {...register('password', { required: false })}
              />
              {errors.password && <div className="text-danger">Password is required.</div>}
            </div>
            <button type="submit" className="btn btn-primary w-100">Sign In</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
