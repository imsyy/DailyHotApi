export type RouterType = {
  "36kr": {
    itemId: number;
    publishTime: number;
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
    timestamp: number;
    miniProShareImage: string;
  };
  "netease-news": {
    title: string;
    imgsrc: string;
    source: string;
    docid: string;
    ptime: string;
  };
  "zhihu-daily": {
    id: number;
    images: [string];
    title: string;
    hint: string;
    url: string;
    type: number;
  };
  "51cto": {
    title: string;
    url: string;
    cover: string;
    abstract: string;
    source_id: number;
    pubdate: string;
  };
  discuz: {
    title: string;
    link: string;
    guid: string;
    content?: string;
    pubDate?: string;
    author?: string;
  };
  bilibili: {
    bvid: string;
    title: string;
    desc?: string;
    pubdate: string;
    pic?: string;
    author?: string;
    video_review?: number;
    owner?: {
      name: string;
    };
    stat?: {
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
    flag_desc: string;
    num: number;
    onboard_time: number;
  };
  zhihu: {
    target: {
      id: number;
      title: string;
      excerpt: string;
      created: number;
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
    event_time: number;
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
      created_at: number;
      view_status: number;
      images: string[];
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
      publishTime: string;
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
    pubTimeLong: number;
  };
  sspai: {
    id: number;
    title: string;
    summary: string;
    banner: string;
    like_count: number;
    released_time: number;
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
    sCreated: string;
  };
  ngabbs: {
    tid: number;
    subject: string;
    author: string;
    tpcurl: string;
    replies: number;
    postdate: number;
  };
  tieba: {
    topic_id: number;
    topic_name: string;
    topic_desc: string;
    topic_pic: string;
    topic_url: string;
    discuss_num: number;
    create_time: number;
  };
  acfun: {
    dougaId: string;
    contentTitle: string;
    userName: string;
    contentDesc: string;
    likeCount: number;
    coverUrl: string;
    contributeTime: number;
  };
  hellogithub: {
    item_id: string;
    title: string;
    author: string;
    description: string;
    summary: string;
    clicks_total: number;
    updated_at: string;
  };
  v2ex: {
    title: string;
    url: string;
    content: string;
    id: number;
    replies: number;
    member: {
      username: string;
    };
  };
  earthquake: {
    NEW_DID: string;
    LOCATION_C: string;
    M: string;
  };
  weatheralarm: {
    alertid: string;
    issuetime: string;
    title: string;
    url: string;
    pic: string;
  };
  huxiu: {
    object_id: number;
    content: string;
    url: string;
    user_info: {
      username: string;
    };
    publish_time: string;
  };
  ifanr: {
    buzz_original_url: string;
    id: number;
    post_content: string;
    post_id: number;
    post_title: string;
    like_count: number;
    comment_count: number;
    created_at: number;
  };
  csdn: {
    nickName: string;
    articleTitle: string;
    articleDetailUrl: string;
    picList: [string];
    hotRankScore: string;
    period: string;
    productId: string;
  };
  history: {
    year: string;
    title: string;
    link: string;
    desc: string;
    cover: string;
    pic_share: string;
  };
  hupu: {
    tid: number;
    title: string;
    replies: number;
    username: string;
    time: string;
    url: string;
  };
  sina: {
    base: {
      base: {
        uniqueId: string;
        url: string;
      };
    };
    info: {
      hotValue: string;
      title: string;
    };
  };
  "sina-news": {
    id: string;
    title: string;
    media: string;
    url: string;
    create_date: string;
    create_time: string;
    top_num: string;
    time: string;
  };
  coolapk: {
    id: number;
    ttitle: string;
    shareUrl: string;
    username: string;
    tpic: string;
    message: string;
    replynum: number;
  };
  guokr: {
    id: number;
    title: string;
    summary: string;
    author: {
      nickname: string;
    };
    date_modified: string;
    small_image: string;
  };
  kuaishou: {
    id: string;
    name: string;
    hotValue: string;
    iconUrl: string;
    poster: string;
    photoIds: {
      json: string[];
    };
  };
  smzdm: {
    content: string;
    title: string;
    article_id: string;
    nickname: string;
    jump_link: string;
    pic_url: string;
    collection_count: string;
    time_sort: string;
  };
  yystv: {
    id: string;
    cover: string;
    title: string;
    preface: string;
    author: string;
    createtime: string;
  };
  dgtle: {
    id: number;
    content: string;
    cover: string;
    from: string;
    title: string;
    membernum: number;
    created_at: number;
    type: number;
  };
  geekpark: {
    post: {
      id: number;
      nickname: string;
      title: string;
      abstract: string;
      cover_url: string;
      views: number;
      published_timestamp: number;
      authors: {
        nickname: string;
      }[];
    };
  };
  linuxdo: {
    id: string;
    title: string;
    url: string;
    author: string;
    desc: string;
    timestamp: string;
  };
};
