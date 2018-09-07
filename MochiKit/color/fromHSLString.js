import partial from '../base/partial';
import fromColorString from './fromColorString';
export default partial(fromColorString, 'hsl', 'fromHSL', [1.0/360.0, 0.01, 0.01, 1]);