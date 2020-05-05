import React from 'react';
import ReactDOM from 'react-dom';
import Welcome from './welcome';
import App from './app';
import { init } from './socket';
import { createStore, applyMiddleware } from "redux";
import reduxPromise from "redux-promise";
import { composeWithDevTools } from "redux-devtools-extension";
import reducer from "./reducer.js";
import { Provider } from 'react-redux';

const store = createStore(
    reducer,
    composeWithDevTools(applyMiddleware(reduxPromise))
);

let elem = <img src="/Logo.png" className="logo" alt="logo" width="100px" height="100px" />;
if (location.pathname == '/welcome') {
    elem = <Welcome />;
} else {
    init(store); //socket will only work if user is logged in
    elem = (
        <Provider store={store}>
            <App />
        </Provider>
    ); // store is the entry way to reduxe
}

// we only call readctDOM.render once in the whole project
ReactDOM.render( //
    elem,
    document.querySelector('main') // this render component
);


