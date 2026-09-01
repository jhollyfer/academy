export interface Animal {
  id: string;
  name: string;
  species: "Cachorro" | "Gato";
  imageUrl: string;
  imageAlt: string;
  location: string;
}

export interface Campaign {
  id: string;
  title: string;
  imageUrl: string;
  imageAlt: string;
  raised: number;
  goal: number;
  daysLeft: number;
}

export interface Stat {
  value: string;
  label: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  avatarUrl: string;
  avatarAlt: string;
}

export const animals: Animal[] = [
  {
    id: "1",
    name: "Mel",
    species: "Cachorro",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCWeNxoS-SL0RZtXQC-adMDruWnLf43dzzNJzzQP43nbddwQoK20ZbYkOYhIYUiBukIAcl-ZYjlvMpvEf_6PyQMoivhUwi7luqaABmktQBhPFLfadX7YQUIg9fF2h8Tx3AqgeaXIOF0-mDqnkYL52Gkt33tlzaRG7srkPp2_X72RJbdicX3d1RGZzWyAfEo380tyBl2ZyQQzUwB_8oJnz5NCcNxkl18QPjzD8mgv2OTpK207PhpnZ-4BwtPnnCOYNLxqlu9bX24Y65a",
    imageAlt: "Mel, cadela vira-lata caramelo sorridente",
    location: "Benjamin Constant, AM",
  },
  {
    id: "2",
    name: "Luna",
    species: "Gato",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAG_45YH2ibpFSvjzRMwGC9Jss5c5a6PrhEHBNA0tvrJR5yMcSz60TUUvYQnWN5bVF8QRQqUbGb8Nnu5InzJm8iLZSx4HS4RuvEXjQS-p5EXRQKB9T7GIF5EKow4tzpKbSn6iH-VODDRqbCvzY6QsJ5qckrGyFf4D3XPy0BIFTC-7hXcH9sVaDcDsoNQF2DgW0LQGN6OmFMyF-bkk34XSyARTZ1BlmCFi_SYwGSdAspvvg91e5acr0IRs3ElAQ_eNNtCdtl6ijfIuIm",
    imageAlt: "Luna, gata preta e branca deitada",
    location: "Benjamin Constant, AM",
  },
  {
    id: "3",
    name: "Pipoca",
    species: "Cachorro",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDPKCln_RMQjVuxkN-CIVVgeXyjuUHpqLxFVxEzZ4JbLM5ipoefLa3r11egf1xHiQaDcFuNnSv0tWRw75hFWCGYQBLWAF3j5Xe29x4nJdcVGvD-FMKQX2AM3PoQNU0z1NYHx9WLt73YQPvDFBIuoyJ-TzGmWMzjjff_GFPsn-KaQ5UBzkIRpynBl7KY48ov75i0AwWRzt3pCYv1sNvgYk-sXh4IuCCb2WuDLjiPaoy59Y9__vna2TZkO5LOnDfEgGJkClImPG-GQ1Xx",
    imageAlt: "Pipoca, cachorro vira-lata caramelo sorridente",
    location: "Benjamin Constant, AM",
  },
  {
    id: "4",
    name: "Tucumã",
    species: "Gato",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuArd6WgV1tsZVQBbJP9av62xeo0oOK3ZwOBYfYJuaFQ7jqGBsuScxrrJR3mtHuQCl1F8KgUclWyaCWRiIutUTNABAVIAN04hUS1QlGoAiLNkYzFmHureglRWYTGLEOzW3fQRKNVKU84UyfVyjwKF1TsWslaL1Ig2UvhoPn3BARrKTzb025jVuNh-tYm45nP5eFazAOfeuU1r3eXCnChHj3bHqpmaN77xhRW72QGrRR6GNG8als3LCUmfo2fvyS49sUa3StCL6-UlnKR",
    imageAlt: "Tucumã, gato cinza olhando fixamente",
    location: "Benjamin Constant, AM",
  },
];

export const campaigns: Campaign[] = [
  {
    id: "1",
    title: "Cirurgia de emergência para o Thor",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDxLXKwWUgnHJMEKOYKNrRmVefHRUMMp0KnJgID5OdD1VKUUEeYZ_DP5YwklHTroA0Z4pIJ1-9oRhPZ7DRuN2rTfNJjhrYBvAo3DFpNlOSwcv9DLfR4UYuR4L3lS14two03-sYrHifeJd8j12BGPqnsi4gPKkMngy3Txt9MrvmopkeV3nKEZBChJtTWdrm0mo86JkjuslCIh1gG8TRWg2N4j4CqkmggQu_ZYSghD2pDXpCpi_OkDr5VHEmBhjgoyHXpdFWjJk8kNh71",
    imageAlt: "Cachorro com pata enfaixada recebendo carinho",
    raised: 1200,
    goal: 2000,
    daysLeft: 4,
  },
  {
    id: "2",
    title: "Ração para colônia de gatos do bairro da Colina",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBP2RHO5d-ocbtfIyxhtMm2LH7HkCvqRx7q-G7oXIn20aijvSM6NDYlBSMrkGxu1fbxWQsJqCrZG9Ww1SXCCUlgRWCc8JN_QYU8gIkDRTgHOJaaXI8in8Tsv9Q3PNO7BeBTXUGyle3L9yu7BEo5ZzmiQ05RZpeXMkG02dG5nu_PlfzKNJ2eMVezwFoN3vd2hnzArLaFxnkUviXgLuXmpFd9kS0UdcbRhZoa72lj5QN4Fo2_fw_PWhB2vPvUORcWRXDw__uh7lDzX78t",
    imageAlt: "Vários gatinhos comendo juntos",
    raised: 3450,
    goal: 4000,
    daysLeft: 12,
  },
  {
    id: "3",
    title: "Castração comunitária — mutirão de dezembro",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDaXC5orBnntRbpiDc-ycnlo4hEyNwzf3RMH17swjnFnYNMm9s3xUNbEozIVLnzmJn9EqiPQs2Xj5Bz6Ji8nCoD0mkAsZPUk5LFdKWszsBWQPpZEKyDM02Cl-WZ2wVoygq-2LCiqUlPwDrny1TF6X0G6hNZ-fWJAMqvLHrRcuPQGlnmNxQlINOPxwU7fB86Y6n1Q--ulFjproC6xVdSJWeLl06njdPEV5oxYhO_OybUxynXp83he-74FkQPJ8OmOOb-7LZzvjX0mZk5",
    imageAlt: "Gato idoso olhando pela janela",
    raised: 8500,
    goal: 12000,
    daysLeft: 20,
  },
];

export const stats: Stat[] = [
  { value: "87", label: "Animais adotados" },
  { value: "142", label: "Denúncias registradas" },
  { value: "R$ 12 mil", label: "Arrecadados em vaquinhas" },
];

export const testimonials: Testimonial[] = [
  {
    id: "1",
    quote:
      "Encontrar a Mel pelo Patinhas na Rua foi a melhor coisa que aconteceu pra minha família. O processo foi simples e hoje ela é a alegria da nossa casa aqui em Benjamin Constant!",
    name: "Raquel Souza",
    role: "Adotou a Mel em Benjamin Constant",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDfIpKknlACdnZwQvg45Tkq2_zcrH1MRc9w2_g5Xeaml1Gw2PhSSCwu1vgbtEPa5vQHh3N4v3LqZp_AEoMWD_mbCFL-VDEtD1QcIVuirCMSn9l2sAzdnXe7PTtp3TgFVDRSMIiXlCpW64wR1Du8TVuLDFhKBPFCNeEmFKlmpr3bAu2soNAcemXk_DJ9cuw7wazMf7nu_wJ2S2U06LAThCBWG4Lf-610rAo4jxxqYs7Vv-D9-OdaeAh-EZUySn63qcj5M5u6Af4fHVEE",
    avatarAlt: "Foto de Raquel Souza",
  },
  {
    id: "2",
    quote:
      "Como protetor independente, ter uma plataforma para divulgar os animais resgatados e receber doações fez toda a diferença. Já conseguimos castrar mais de 30 animais na cidade.",
    name: "Francisco Mendes",
    role: "Protetor independente em Benjamin Constant",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC012zQOvaPocHDCi4NykvlAOw-CcX2Sk1VI5oppzGndc24e0OSbhE1nYR3j3nLfuiq5JiObj6rWD0XHfmddtAxS-rEXBinCGwqpAshQGhw24StPULdjbqNvXbK_DSOMWPOL_s9RBPOba9tdkShcdddClvTCZ7Qi8-1XSL3m433fjvntbcfhtgwj_u355M5kHGg90OxwyU7Pr95ZO7G3biZnFuszVjhbsD8DzXfHGQx-vbysBfrtmK1YpEtoMjb2DlZV6uJOjlcpjuM",
    avatarAlt: "Foto de Francisco Mendes",
  },
];
