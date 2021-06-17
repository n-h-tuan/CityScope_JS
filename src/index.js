import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, BrowserRouter } from "react-router-dom";

import App from "./App";
import Provider from "./redux/Provider";
import store from "./redux/store";
// console.log(require('./Express/index'));

// console.log(require('express'));

// ! basename={process.env.PUBLIC_URL}

ReactDOM.render(
    <Provider store={store}>
        {/* https://github.com/facebook/create-react-app/issues/1765 */}
        <BrowserRouter basename={process.env.PUBLIC_URL}>
            <App />
        </BrowserRouter>
    </Provider>,
    document.getElementById("root")
);
