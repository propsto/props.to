<!-- Banner here -->

# <h1 style="text-align: center;"><img style="vertical-align:sub;" src="https://props.to/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fprops.to.c7d44c4b.png&w=64&q=75" width="30" alt="" />&nbsp;Props.to</h1>


<p align="center" style="margin-top: 20px">
  <p align="center">
  Open Source Feedback Platform
  <br>
    <a href="https://props.to"><strong>Learn more »</strong></a>
    <br />
    <br />
    <a href="https://props.to">Website</a>
    ·
    <a href="https://github.com/propsto/props.to/issues">Issues</a>
    ·
    <a href="https://github.com/propsto/props.to/milestones">Roadmap</a>
  </p>
</p>

![Vercel](https://vercelbadge.vercel.app/api/propsto/props.to)

## About this project

Feedback throughout internet is a lost cause. Literally. No one knows which entity to trust. Whether you are a company, an internet figure, have social network presence or simply an employee, you can't own your feedback throughout all your public or private profiles. Until now.

Props.to is the go-to open source solution to own your feedback throughout all your connected profiles. Anyone could send you feedback even without your knowledge and then claim it by connecting your feedbacked profile to your account. Most importantly, you will be able to retain Props.to private feedback by your employer and choose to publish it in your Props.to public profile. You might change your job, but the feedback remains, allowing you to build more realistic and humane internet presence through Props.to.

## Getting Started

1. Install dependencies

```bash
pnpm install
```

2. Start the db

```bash
docker compose up -d
```

3. Update env and push the schema to the db

```bash
cp .env.example .env
pnpm prisma db push
```

4. Start the dev server

```bash
pnpm dev:all
```

5. Run the tests

```bash
pnpm test
```

---
