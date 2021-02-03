![CI](https://github.com/ryankscott/finish-em/workflows/CI/badge.svg)
![CodeQL](https://github.com/ryankscott/finish-em/workflows/CodeQL/badge.svg)

<div style="display:flex;flex-direction:row;height:80px;align-items:center;">
<img src="https://github.com/ryankscott/finish-em/raw/master/app/renderer/assets/finish_em.svg"
  width="64"
  height=64"
  >
  <h1>Finish-em </h1>
</div>

An org-mode inspired personal organiser

## Getting Started

Basic guide to getting Finish-em up and running

### Installing

Initially clone the repo

```
git clone https://github.com/ryankscott/finish-em.git
```

Install the dependencies

```
npm install
```

## Developing

### Running the web app (development)

To run the web version of Finish-em run the following:

```
npm run dev
```

### Running the Electron version (development)

```
npm run dev start-dev
```

## Building

### Building the Electron app

The following commands will build the mac version of Finish-em

```
npm run clean
npm run build
npm run dist
```
