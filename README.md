# remix-action-router

> Declarative action matching for Remix actions

`remix-action-router` is a small utility that allows setting up your Remix actions as route files. It takes Remix's declarative approach to network calls and applies it to route actions.

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/dorshinar/remix-action-router/%F0%9F%9A%80%20Deploy)
![npm](https://img.shields.io/npm/v/remix-action-router)

## Getting Started

Let's assume we have a route component in `app/routes/item/$id.tsx` that handles basic CRUD logic for shopping cart items.

```ts
// filename: app/routes/item/$id.tsx

export function action({ request }) {
  const formData = await request.formData();
  const actionName = formData.get("_action");

  switch (actionName) {
    case "create": {
      // create logic
    }
    case "delete": {
      // delete logic
    }
    case "update": {
      // update logic
    }
  }
}
```

With `remix-action-router` you can move the logic of each action to a specific file under the `routes/actions__` folder and have `remix-action-router` take care of the action matching logic.

The folder structure must match your routes structure in such a way that each route file becomes its own folder, and each action becomes a file under said folder.

Effectively, your routes folder will look like this:

```
app/
└── routes/
    ├── actions__/
    │   └── item/
    │       └── $id/
    │           ├── create.ts
    │           ├── delete.ts
    │           └── update.ts
    └── item/
        └── $id.tsx
```

Back to `app/routes/item/$id.tsx`, you can replace your action function definition with:

```ts
// filename: app/routes/item/$id.tsx

import { callAction } from "remix-action-router";

export const action = callAction;
```

Each of your actions files (eg. `app/routes/actions__/item/$id/create.ts`) should export a default function. This function should include the action logic.

For example:

```ts
// filename: app/routes/actions__/item/$id/create.ts
import type { ActionRouteFunction } from "remix-action-router";

const create: ActionRouteFunction = ({ formData }) => {
  return prisma.item.create({ data: ... });
};

export default create;
```

## Configuration

The `callAction` method accepts a second parameter that is a configuration object.

```ts
// filename: app/routes/item/$id.tsx

export function action(args) {
  return callAction(args, { actionName: "customActionName" });
}
```

The options are:

### actionName

By default, `remix-action-router` will use the value in the `_action` field on the request's `formData` property. This can be overridden using the `actionName` config field.

### actionsRoute

By default, `remix-action-router` will search for action files under the `app/routes/actions__` directory. This option allows configuring the path for the actions.
Note that the action files route is relative to `app/routes`.

## Caveats

`remix-action-router` uses the `_action` FormData field to determine which action to run. To get that value, `remix-action-router` must call `await request.formData()`.

Because of that, calling `await request.formData()` in your action functions will result in an error. To overcome this, `remix-action-router` will add the `formData` object as an argument to your action functions.

So, instead of Remix's usual action arguments:

```ts
export interface DataFunctionArgs {
  request: Request;
  context: AppLoadContext;
  params: Params;
}
```

You get arguments that look like so:

```ts
interface ActionArgs {
  request: Request;
  context: AppLoadContext;
  params: Params;
  formData: FormData;
}
```

All other params are left untouched.
