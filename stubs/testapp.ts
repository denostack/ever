console.log(Deno.env.toObject());

for (let i = 0; i < 5; i++) {
  console.log(`stdout(nl) ${i}`);
  await new Promise((resolve) => setTimeout(resolve, 100));
}

const te = new TextEncoder();
for (let i = 0; i < 5; i++) {
  Deno.stderr.writeSync(te.encode(`stderr(nl) ${i}\n`));
  await new Promise((resolve) => setTimeout(resolve, 100));
}

for (let i = 0; i < 5; i++) {
  Deno.stdout.writeSync(te.encode(`stdout ${i}`));
  await new Promise((resolve) => setTimeout(resolve, 100));
}

for (let i = 0; i < 5; i++) {
  Deno.stderr.writeSync(te.encode(`stderr ${i}`));
  await new Promise((resolve) => setTimeout(resolve, 100));
}

throw new Error("error!");
