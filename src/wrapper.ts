import * as express from 'express';
import { init, close } from './oracleMobile';
import * as omce_api from '../../ash_sky'; // your API to deploy to the OMCe back-end

const app = express();
const port = 4000;
app.use(init);
omce_api(app);
app.listen(port, () => console.log(`Server listening on port ${port}!`));
// app.use(close);