//
// Copyright © 2020 Province of British Columbia
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import React from 'react';

// TODO: sort out a way to declare ts returned value to be null | array of react components
const NewlineText = (props: any) => {
    const text = props.text;

    if (!text) {
        return null;
    }

    return text.split('\n\n').map((str: string, index: number) => <p key={index} >{str}</p>);
}

export default NewlineText;