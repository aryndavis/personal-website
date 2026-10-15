import type { Entry } from './types'

// Mirrors the posts on https://arynlynn.substack.com. Newest posts can go anywhere; the site sorts by date.
export const educationPosts: Entry[] = [
  {
    slug: 'what-do-we-even-need-education-for',
    title: 'What do we even need education for?',
    subtitle: 'In critiquing the U.S. public education system, are we missing the forest for the trees?',
    date: '2026-09-25',
    summary: 'In critiquing the U.S. public education system, are we missing the forest for the trees?',
    tags: ['education', 'public education'],
    substackUrl: 'https://arynlynn.substack.com/p/what-do-we-even-need-education-for',
    body: [
      {
        type: 'p',
        text: [
          'The U.S. public education system is broken. With recent discussions around ',
          {
            text: 'making tough calls on school choice',
            href: 'https://www.nytimes.com/2026/09/20/magazine/ny-public-schools-black-students-segregation.html?unlocked_article_code=1.ClE.PNwc.HqP-rdb1xnd4&smid=nytcore-ios-share',
          },
          ', ',
          {
            text: 'declining test scores',
            href: 'https://www.nytimes.com/2026/05/13/upshot/test-scores-school-districts-us.html?unlocked_article_code=1.iFA.G_Ub.cXbz5_-EC4R3&smid=url-share',
          },
          ', and ',
          {
            text: 'worries that grade inflation is covering up real issues',
            href: 'https://www.nea.org/nea-today/all-news-articles/grade-inflation-real-it-real-problem',
          },
          ', we can all agree we need an overhaul ',
          { text: 'of', em: true },
          ' ',
          { text: 'something', em: true },
          '. The main issues often at the front of the headlines don’t even touch on the other issues that teachers themselves see mounting in severity: classroom management taking up more and more time, being overworked and underpaid, and a general lack of resources. It is not acceptable for students and parents to squeeze as much as they can out of the public school system and then move to charter or private schools if their needs are still not met. We have a duty to all children in America to give them a quality and engaging education, and some kids are not more deserving of that just because they happen to be smarter or more resourced than the rest of their class.',
        ],
      },
      {
        type: 'p',
        text: 'In trying to monitor and improve public education, administrators and the general public have largely turned to big data as an easy snapshot of what is working and what is not. At a high level, we have standardized test scores for every student across multiple grade levels, and depending on how tech-y the school is, we can track everything from how often students go to the bathroom in a semester to which specific learning objectives a student struggles with. But data is supposed to tell a story, and what is our public education system’s data supposed to tell? What incentives make every measured action something worthy of tracking? What are we educating for?',
      },
      {
        type: 'image',
        src: 'images/education/what-do-we-even-need-education-for.jpg',
        alt: 'Cartoon of a red-brick school building with three large black question marks over it.',
      },
      {
        type: 'p',
        text: 'These questions speak to a larger incentive problem with our current education system. Is our current system the result of reducing education to a necessary step to get a job? If society no longer sees value in educating students so they could love learning or seek to understand more about the world, is this what we get?',
      },
      {
        type: 'p',
        text: 'Now, this is largely not a public education-specific issue; many parts of society have been ground down into ways to extract more capital from others for less value. It is a problem on many levels, and many people are looking for ways to be the ones exploiting versus being exploited. To fix this in education, we would need a total cultural shift. Unfortunately, schools reflect many cultural problems, and because it is assumed to be easier to ‘fix’ kids than adults, we often try to solve them in shallow ways by attacking only the school system. This leaves teachers to deal with the consequences, even though we all play a part.',
      },
      {
        type: 'p',
        text: 'But what if our public education system could do more? Other than taxes, how much community engagement does the average public school get? What if education was a deeply revered cultural value, with resourcing to reflect it? What if the goal of education could be motivating students to take pride in the world and seek knowledge for its own sake?',
      },
      {
        type: 'p',
        text: 'For example, many students who struggle with math sometimes turn into adults who advocate for less challenging math courses, à la, “we don’t even use algebra in the real world.” If you ask any math teacher, this is categorically false, but it also points to students not fully understanding the subject’s real-world applications. Similarly, students who disliked an assigned book in English class and assumed reading isn’t for them miss that forming an opinion about a book and explaining why you didn’t like it is part of the most critical forms of analysis. If you can do basic math, you can also file your taxes. If you understand basic and acidic solutions in chemistry, you won’t accidentally burn yourself with the wrong combination of cleaning supplies. What we learn in school connects to life, and students are more engaged when teachers highlight that connection (even if these things are also useful to the tests).',
      },
      {
        type: 'p',
        text: 'This cultural shift in perspective is not everything, though. It is hard to get students to learn; learning can often be boring. But learning to be bored is a valuable skill too. When students develop the skill of learning, using other tools to support their goals becomes even more fulfilling. What does it matter if AI can do your work for you if you can’t engage with it? What do we achieve when everyone is a ‘master’ of tools with no fundamentals? But if we keep this larger societal value of tests, jobs, and money over learning and understanding, we will only accelerate our demise.',
      },
      {
        type: 'p',
        text: 'The data we collect on students to assess educational progress should only be part of the picture. Large systems need accountability, and accountability can take many forms. If students have issues that are discovered on assessment, those should be addressed. But we cannot make data and assessment the end in itself. What does it look like to make data like test scores secondary to a broader way of assessing how a student has progressed over the year?',
      },
      {
        type: 'p',
        text: 'Not all students need to walk away with a love of learning. It’s okay if someone graduates from a K-12 learning system and never wants to set foot in a classroom ever again. Not all teachers are perfect, and not every subject is equally engaging. The idea that public education only serves a test and that more holistic, attentive education is found elsewhere is the issue. We should invest in our public education system because every student deserves to feel that their development into a human being, and not just a worker, is valued.',
      },
    ],
  },
]
