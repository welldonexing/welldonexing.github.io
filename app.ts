import {
  green,
  cyan,
  bold,
  yellow,
  red,
} from "https://deno.land/std@0.52.0/fmt/colors.ts";
import { DATA_TYPES, Database, Model } from "https://deno.land/x/denodb/mod.ts";
import {
  Application,
  HttpError,
  send,
  Status,
  Context,
  isHttpError,
  Router,
  RouterContext,
  RouterMiddleware,
} from "https://deno.land/x/oak/mod.ts";

function noop() {
  console.log("uncaughtException");
}
addEventListener("error", (evt) => {
  console.log(evt); // contains the thrown error
});

try {
  const app = new Application();

  app.addEventListener("error", (evt) => {
    console.log(evt.error); // contains the thrown error
  });
  //database config /////////////////////////////////////////

  const db = new Database("mysql", {
    host: "127.0.0.1",
    username: "root",
    password: "wszgr",
    database: "lualog",
    port: 3306,
  });
  //https://github.com/eveningkid/denodb
  class lualog extends Model {
    static table = "log";
    static timestamps = true;

    static fields = {
      idx: {
        primaryKey: true,
        autoIncrement: true,
      },
      id: DATA_TYPES.STRING,
      time: DATA_TYPES.STRING,
      data: DATA_TYPES.STRING,
      ect: DATA_TYPES.STRING,
    };

    static defaults = {
      flightDuration: 2.5,
    };
  }

  try {
    db.link([lualog]);
  } catch (e) {
    console.log("e1" + e);
  }

  /////////////////////////////////////////////////

  const router = new Router();
  router
    .get("/he", (context) => {
      context.response.body = "Hello world!";
    })
    .get<{ id: string }>("/lualog/:id", async (context) => {
    	var num:number = parseInt(context.params.id)
    	//console.log(num,context.params.id)
      try {
        //await lualog.all();
        
        if (num <10 ){
        	num = 10 ;
        }
        
        var res = await lualog.take(num).get();
        //console.log (res)
        context.response.body = res;
      } catch (e) {
        console.log(e);
      }
    });

  // Error handler middleware
  app.use(async (context, next) => {
    try {
      await next();
    } catch (e) {
      if (e instanceof HttpError) {
        context.response.status = e.status as any;
        if (e.expose) {
          context.response.body = `<!DOCTYPE html>
            <html>
              <body>
                <h1>${e.status} - ${e.message}</h1>
              </body>
            </html>`;
        } else {
          context.response.body = `<!DOCTYPE html>
            <html>
              <body>
                <h1>${e.status} - ${Status[e.status]}</h1>
              </body>
            </html>`;
        }
      } else if (e instanceof Error) {
        context.response.status = 500;
        context.response.body = `<!DOCTYPE html>
            <html>
              <body>
                <h1>500 - Internal Server Error</h1>
              </body>
            </html>`;
        console.log("Unhandled Error:", red(bold(e.message)));
        console.log(e.stack);
      }
    }
  });

  // Logger
  app.use(async (context, next) => {
    await next();
    const rt = context.response.headers.get("X-Response-Time");
    console.log(
      `${green(context.request.method)} ${
        cyan(context.request.url.pathname)
      } - ${
        bold(
          String(rt),
        )
      }`,
    );
  });

  // Response Time
  app.use(async (context, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    context.response.headers.set("X-Response-Time", `${ms}ms`);
  });
  // Use the router
  app.use(router.routes());
  app.use(router.allowedMethods());
  // Send static content
  app.use(async (context) => {
    await context.send({
      root: `${Deno.cwd()}/static`,
      index: "index.html",
    });
  });

  const options = { hostname: "", port: 8000 };
  console.log(
    bold("Start listening on ") + yellow(`${options.hostname}:${options.port}`),
  );

  await app.listen(options).catch((err) => {
    console.log("catch " + err); // catch error
  });
} catch (e) {
  console.log("m0" + e);
}
