import React from 'react';
import MatomoContext from './MatomoContext';
const MatomoProvider = function ({ children, value, }) {
    const Context = MatomoContext;
    return React.createElement(Context.Provider, { value: value }, children);
};
export default MatomoProvider;
//# sourceMappingURL=MatomoProvider.js.map