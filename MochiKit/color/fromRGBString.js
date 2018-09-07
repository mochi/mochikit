const result = 1.0/255;
import partial from '../base/partial';
import fromColorString from './fromColorString';
export default partial(fromColorString('rgb', 'fromrgb', [result, result, result, 1]));