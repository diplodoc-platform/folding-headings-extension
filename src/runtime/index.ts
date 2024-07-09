import {GLOBAL_KEY} from './const';
import {HeadingSectionContoller} from './controller';

import './styles/index.scss';

if (typeof window !== 'undefined' && typeof document !== 'undefined' && !window[GLOBAL_KEY]) {
    window[GLOBAL_KEY] = new HeadingSectionContoller(document);
}

declare global {
    interface Window {
        [GLOBAL_KEY]: HeadingSectionContoller;
    }
}
