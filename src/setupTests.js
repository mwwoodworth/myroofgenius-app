import '@testing-library/jest-dom';
import axe from '@axe-core/react';
import React from 'react';
import ReactDOM from 'react-dom';

// instrument React with axe for a11y checks during tests
axe(React, ReactDOM, 1000);
