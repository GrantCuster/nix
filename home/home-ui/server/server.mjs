import express from "express";
import util from "util";
import cors from "cors";
import { WebSocketServer } from "ws";
import { exec as cexec } from "child_process";

const exec = util.promisify(cexec);
const app = express();
const port = 6049;

app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

app.use("/home/grant", express.static("/home/grant"));

async function getWorkspaceTree() {
  const workspaceExec = await exec(
    `hyprctl workspaces -j | jq 'map({name: .name, id: .id, windows: .windows})'`
  );
  const tree = JSON.parse(workspaceExec.stdout);
  for (const space of tree) {
    space.startTime = null;
  }
  const sortedWorkspacesExec = await exec(`json_recent_workspaces`);
  const sortedWorkspaces = JSON.parse(sortedWorkspacesExec.stdout);
  const namesLookup = tree.map((space) => space.name);
  let sortedTree = [];
  let nameCheck = [];
  for (const name of sortedWorkspaces) {
    if (name !== "home" && !nameCheck.includes(name)) {
      const index = namesLookup.indexOf(name);
      sortedTree.push(tree[index]);
      nameCheck.push(name);
    }
  }
  return sortedTree;
}

const wss = new WebSocketServer({ port: 6050 });

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", async function message(data) {
    const json = JSON.parse(data);
    if (json.action === "command") {
      exec(json.payload, (error, stdout, stderr) => {
        ws.send(JSON.stringify({ action: json.payload, response: stdout }));
      });
    } else if (json.action === "get_workspace_tree") {
      const tree = await getWorkspaceTree();
      ws.send(JSON.stringify({ action: "get_workspace_tree", response: tree }));
    } else if (json.action === "workspaces_updated") {
      const tree = await getWorkspaceTree();
      const active_workspace = await exec(
        `hyprctl -j activeworkspace | jq -r .name`
      );
      wss.clients.forEach(function each(client) {
        client.send(
          JSON.stringify({
            action: "active_workspace_updated",
            response: active_workspace.stdout,
          })
        );
        client.send(
          JSON.stringify({ action: "get_workspace_tree", response: tree })
        );
      });
    } else if (json.action === "active_todos_updated") {
      const contents = await exec(`cat ~/obsidian/todo/Active\\ todo.md`);
      wss.clients.forEach(function each(client) {
        client.send(
          JSON.stringify({
            action: "active_todos_updated",
            response: contents.stdout,
          })
        );
      });
    } else if (json.action === "system_ideas_updated") {
      const contents = await exec(`cat ~/obsidian/todo/System\\ ideas.md`);
      wss.clients.forEach(function each(client) {
        client.send(
          JSON.stringify({
            action: "system_ideas_updated",
            response: contents.stdout,
          })
        );
      });
    } else if (json.action === "screenshots_updated") {
      const contents = await exec(`find ~/*.png`);
      wss.clients.forEach(function each(client) {
        client.send(
          JSON.stringify({
            action: "screenshots_updated",
            response: contents.stdout,
          })
        );
      });
    } else if (json.action === "battery_status") {
      const contents = await exec(`battery_status_websocket`);
      wss.clients.forEach(function each(client) {
        client.send(
          JSON.stringify({
            action: "battery_status",
            response: contents.stdout,
          })
        );
      });
    }
  });
});

app.listen(port);
