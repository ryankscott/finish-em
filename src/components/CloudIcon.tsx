import { Flex, Text } from "@chakra-ui/react";

const CloudIcon = () => (
  <Flex w="100%" alignItems="center" direction="column" my={4}>
    <svg
      width="60"
      height="60"
      viewBox="0 0 1200 1200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_d)">
        <rect
          x="100"
          y="100"
          width="1000"
          height="1000"
          rx="200"
          fill="#DBDBDB"
        />
        <rect
          x="100"
          y="100"
          width="1000"
          height="1000"
          rx="200"
          fill="url(#paint0_linear)"
        />
      </g>
      <g filter="url(#filter1_d)">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M548.666 938.23L548.666 938.23L994.584 406.806C1005.38 393.935 1010.78 387.5 1012.4 380.482C1013.83 374.309 1013.26 367.843 1010.79 362.011C1007.97 355.382 1001.54 349.982 988.667 339.182L889.361 255.854C876.49 245.054 870.055 239.654 863.037 238.034C856.864 236.609 850.398 237.174 844.566 239.65C837.937 242.464 832.537 248.899 821.737 261.77L490.643 656.353L354.405 541.832C341.544 531.021 335.113 525.615 328.099 523.991C321.929 522.562 315.466 523.125 309.636 525.598C303.008 528.41 297.608 534.845 286.808 547.716L203.48 647.023C192.68 659.894 187.281 666.329 185.658 673.349C184.232 679.524 184.795 685.993 187.267 691.828C190.078 698.462 196.508 703.868 209.37 714.679L363.707 844.414C367.4 848.789 373.128 853.596 381.734 860.817L381.735 860.817L381.735 860.818L481.042 944.146L481.043 944.147C493.913 954.946 500.348 960.346 507.366 961.966C513.539 963.391 520.005 962.826 525.836 960.35C532.466 957.536 537.866 951.101 548.666 938.23Z"
          fill="url(#paint1_linear)"
        />
      </g>
      <defs>
        <filter
          id="filter0_d"
          x="92"
          y="100"
          width="1016"
          height="1018"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="10" />
          <feGaussianBlur stdDeviation="4" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow"
            result="shape"
          />
        </filter>
        <filter
          id="filter1_d"
          x="180.887"
          y="237.265"
          width="836.285"
          height="733.47"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint0_linear"
          x1="600"
          y1="100"
          x2="600"
          y2="1100"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.589017" stop-color="white" />
          <stop offset="1" stop-color="white" stop-opacity="0" />
        </linearGradient>
        <linearGradient
          id="paint1_linear"
          x1="945.5"
          y1="277.5"
          x2="405.5"
          y2="876"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#FF0000" />
          <stop offset="1" stop-color="#6720FF" />
        </linearGradient>
      </defs>
    </svg>
    <Text fontSize="4xl" fontWeight="bold">
      Finish-em Cloud
    </Text>
  </Flex>
);

export default CloudIcon;
