// import axios from './axios';
// import React, { useState } from 'react';

// export function useAuthSubmit(url, values) {
//     const [error, setError] = useState(false);

//     const submit = () => {

//         axios.post(url, values).then(({ data }) => {
//             if (data.success) {

//                 location.pathname('/');
//             } else {
//                 setError(true);
//             }


//         });


//     };

//     return [error, submit];
// }