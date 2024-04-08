export type RouterType = {
  "36kr": {
    itemId: number;
    templateMaterial: {
      widgetTitle: string;
      authorName: string;
      statCollect: number;
      widgetImage: string;
    };
  };
  "qq-news": {
    id: string;
    title: string;
    abstract: string;
    source: string;
    hotEvent: {
      hotScore: number;
    };
    miniProShareImage: string;
  };
  "netease-news": {
    title: string;
    imgsrc: string;
    source: string;
    docid: string;
  };
  "zhihu-daily": {
    id: number;
    images: [string];
    title: string;
    hint: string;
    url: string;
    type: number;
  };
  bilibili: {
    bvid: string;
    title: string;
    desc: string;
    pic: string;
    owner: {
      name: string;
    };
    stat: {
      view: number;
    };
    short_link_v2?: string;
  };
  juejin: {
    content: {
      content_id: string;
      title: string;
      name: string;
    };
    author: {
      name: string;
    };
    content_counter: {
      hot_rank: string;
    };
  };
  weibo: {
    mid: string;
    word: string;
    word_scheme: string;
    note: string;
    category: string;
    raw_hot: number;
  };
  zhihu: {
    target: {
      id: number;
      title: string;
      excerpt: string;
    };
    children: [
      {
        thumbnail: string;
      },
    ];
    detail_text: string;
  };
  douyin: {
    sentence_id: string;
    word: string;
    hot_value: number;
  };
  baidu: {
    index: number;
    word: string;
    desc: string;
    img: string;
    hotScore: string;
    show: string;
    rawUrl: string;
    query: string;
  };
  miyoushe: {
    post: {
      post_id: string;
      subject: string;
      content: string;
      cover: string;
    };
    stat: {
      view_num: number;
    };
    user: {
      nickname: string;
    };
    image_list: [
      {
        url: string;
      },
    ];
  };
  weread: {
    readingCount: number;
    bookInfo: {
      bookId: string;
      title: string;
      intro: string;
      cover: string;
      author: string;
    };
  };
  toutiao: {
    ClusterIdStr: string;
    Title: string;
    HotValue: string;
    Image: {
      url: string;
    };
  };
  thepaper: {
    contId: string;
    name: string;
    pic: string;
    praiseTimes: string;
  };
  sspai: {
    id: number;
    title: string;
    summary: string;
    banner: string;
    like_count: number;
    author: {
      nickname: string;
    };
  };
  lol: {
    sAuthor: string;
    sIMG: string;
    sTitle: string;
    iTotalPlay: string;
    iDocID: string;
  };
  ngabbs: {
    tid: number;
    subject: string;
    author: string;
    tpcurl: string;
    replies: number;
  };
  tieba: {
    topic_id: number;
    topic_name: string;
    topic_desc: string;
    topic_pic: string;
    topic_url: string;
    discuss_num: number;
  };
  acfun: {
    dougaId: string;
    contentTitle: string;
    userName: string;
    contentDesc: string;
    likeCount: number;
    coverUrl: string;
  };
  hellogithub: {
    item_id: string;
    title: string;
    author: string;
    description: string;
    summary: string;
    clicks_total: number;
  };
};
