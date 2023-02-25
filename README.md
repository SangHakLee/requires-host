# requires-version

## Install
```bash
$ npm install requires-version ---save-dev
```

## Usage
```typescript
import {LESS, GREATER, EQUAL, requires} from 'requires-version';

requires('node'); // return true|false

requires('node', '18.14.1', GREATER | EQUAL); // return true|false
```