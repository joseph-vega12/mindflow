import React, { FC } from 'react';

import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box } from '@chakra-ui/react';
import { BasePage, BasePageTitle } from 'components/layout/Pages';

export const Faq: FC<{}> = () => {
  const faqQuestions = [
    {
      title: 'When does the course start and finish?',
      text:
        'MindFlow starts as soon as you purchase and register your account. MindFlow is specially designed to help you perform your best on your upcoming test, so it’s ideal if you learn MindFlow skills with enough time to practice techniques as part of your whole study success process. While you can continue to improve your timing and comprehension over time, our students have had score improvements on their official tests after learning MindFlow techniques mere days before their test.  You have three months to complete the program, but contact us if you want to extend it for a nominal fee.'
    },
    {
      title: 'How long will the course take to complete?',
      text:
        'You set the pace! More than just watching the lectures you’ll be completing the exercises, which include practicing and integrating the skills you learn. You’re immediately able to apply the skill sets when working with your own study material or when reading for school, work or in life. While MindFlow is a streamlined program, you’ll continue to increase reading speed and comprehension the more you practice. We’d say the minimal amount to begin to see improvements is 3-5 hours but you keep on improving with up to 12 hours of material we provide for you. As the adage goes: the more you practice, the better…and faster you get! With our mindset training, changing your outlook or perspective can take time, repetition and consistency to gain maximum benefits. Still, some of the mind hacks we include quickly allay your anxiety and fears. Once you identify what works in this arena, stick with it, and add it to your mindset toolbox.'
    },
    {
      title: 'How exactly does MindFlow work? ',
      text: `MindFlow’s training is a convenient, easy-to-use solution for the two main issues that thwart students' efforts when taking high-stakes tests: time management and test anxiety. It is an engaging and structured program for reading faster, improving comprehension, and upgrading your mindset. Regardless of how much you study for a high-stakes test (or on tests in general), your performance may be compromised if you aren't effective and efficient in the time allotted or able to stay calm and confident amid any emotional stress brought on by the pressure of the test experience itself. MindFlow’s speed reading training is both systematic and test-specific. After learning the methods, you have opportunities to use your new skills through reading speed assessment tests, diagnostic tests, and reading practice with the essays included or material you upload yourself onto the platform. You can practice the skills off of your computer screen any regular reading material, books, magazines, newspapers on on-screen websites, articles and emails. MindFlow’s incorporation of mindful, holistic modalities and other self care and wellness recommendations help students to ‘fire their inner critic’ and get out of their own way. Students gain a better understanding through growth mindset and positive psychology to optimize their experience of adopting new habits. MindFlow’s mindset tools help you enter the test-taking zone with focus, ease, confidence and drive. In addition to reading faster and comprehending more, the positive experience of successfully doing something feels good and we want to continue to do it. There is science behind this: when we do something good we release dopamine, known as the “feel-good” hormone because it provides a sense of pleasure when released. So your body is actually working in cahoots and rewarding you by increasing your desire to study more! As students improve with MindFlow, they naturally want to study more, so this not only helps with the reading comprehension sections of tests - - but also study for other test sections and with study in general.`
    },
    {
      title: 'Does MindFlow require active participation or can it be a spectator-sport?',
      text:
        'MindFlow is absolutely a participatory learning experience! To improve, you must learn the skills and reinforce them with practice. Knowing the skills in ‘theory’ is not enough. There are videos to watch that teach you the ‘what,’ ‘why,’ and ‘how’ of speed reading and then, you have opportunities to implement the training in practice modules. In fact, your success is a direct result of your active participation. Typically, you can learn the system in 3–5 hours but the more you practice, the better your results. Your reading speed will likely increase 1.5 – 2x initially with the same or improved comprehension. With ongoing practice, you can increase your reading speed up to 5x (or even faster!), while improving your ability to comprehend what you’re reading as well. Speed Reading faster than 500 wpm is likely not necessary for your upcoming test. Your goal is to read as fast as you can with the best comprehension possible. Throughout the training, you will learn to gauge how to achieve the balance between speed and comprehension as you practice. You’ll also be able to apply all of MindFlow techniques to just about anything you read. What isn’t ideal to speed read includes dense material like science or material that is equation-heavy. You likely may not want to implement it for poetry, haiku or ‘owner’s manuals’. It’s most ideal for any kind of narrative and prose formats.'
    },
    {
      title: 'Why does MindFlow work?',
      text:
        '80% of reading comprehension questions reference about 20% of what you read. When you speed read, you gain familiarity with the material without latching onto details. This helps you go back to find the answers more quickly, then use additional time you gain by reading fast to answer the questions in your own words, think critically, then match your answer choice to the choices provided. Gaining more time to engage with the questions and answers typically means you can be more careful about responding correctly, which improves your exam score. Plus, any additional time you save by reading fast allows more time in the same section with other types of questions. Once you master the skills, and your comprehension catches up with your intake of words, you’ll find you’re able to retain and recall more information. MindFlow’s incorporation of holistic and mindful tools improves your mindset and outlook. This helps you focus and fully engage, which supports your overall experience taking the test. Further, when we get a positive result from doing things, we get a dopamine hit, similar to the feeling when we cross things off our to-do list. That positive dopamine ‘hit’ feels good and it compels us to want to do more of what helped to create this feeling. This, along with seeing quick improvements, is why our students are jazzed about subsequent study after they complete MindFlow.'
    },
    {
      title: 'Who is MindFlow for?',
      text:
        'MindFlow tools help anyone who wants to read faster and comprehend more. MindFlow was specifically designed for students either taking admissions tests with reading comprehension questions or wanting to be more efficient with academic reading.  It is also useful for students who want to improve general English test scores, breeze through reading assignments and complete verbal homework faster. It’s even helpful for students who want to improve reading English when it’s not their native language. MindFlow tracks include tests taken in middle school (ISEE, SHSAT, SSAT), high school (ACT and SAT), college and beyond (LSAT, GRE, MCAT and GMAT/EA) as well as those taking language tests to show proficiency in the English language (TOEFL, IELTS and PTE). If you are taking a different test that includes reading, such as the NCLEX or The BAR Exam, you will also benefit from this program. We recommend that if your test is not represented on our site, to take a reading section diagnostic from your test before and after you complete the MindFlow program and incorporate your own reading material into the platform itself as part of your study or do it off platform. You can also use MindFlow if you’re not taking a test, but want to improve your reading. Other general MindFlow tracks are school based (middle school, high school, college, business school, graduate school, medical school and law school) as  well as an adult track. Parents can also enjoy the tools herein! MindFlow also includes material that helps the student who panics or gets nervous before or during tests. If you have a lot of reading on top of your academic or professional responsibilities, you will benefit from MindFlow. It will help you have more time for yourself, family, friends, and fun.'
    },
    {
      title: 'Will I receive a certificate?',
      text:
        'Once you finish the program, you will receive a course completion certificate which you can share on social media and elsewhere.'
    },
    {
      title: 'Do you offer refunds?',
      text:
        'If you do not complete MindFlow and are not satisfied, reach out to get a refund. It’s that easy. No refunds are given after completion of the program.'
    },
    {
      title: 'Does MindFlow track my improvement?',
      text:
        'Yes! MindFlow tracks your progress and allows you to see your improvements. If you finish the platform in less than three months, you’ll continue to have the opportunity to partake in exercises to hone your speed reading and upgrade your mindset with another test track at a comparable level. The more you practice, the faster you’ll read. The more you include wellness tools, the more confident, focused and relaxed you’ll feel.'
    },
    {
      title: 'How long will I have access to the course material?',
      text: 'You have access to MindFlow for 3 months with an option to lengthen your subscription for a nominal fee.'
    },
    {
      title: 'Do you offer MindFlow to groups, schools and/or clubs?',
      text:
        'Absolutely! We’d love to offer MindFlow to your students or groups! While students will increase their speed and improve their reading scores, MindFlow also acts as a catalyst for more learning, better studying, and overall well being. MindFlow increases engagement, productivity and helps students compete at higher levels. Please email our Business Manager at business@mindflowspeedreading.com to discuss a customized program for your club, school, academic or professional groups. Each business, tutor or group can get a dedicated dashboard to track your participants’ progress.'
    },
    {
      title:
        'How do I watch the videos? Am I meant to watch everything first and then practice or can I switch off between watching the videos, practice, speed tests, and diagnostics?',
      text:
        'The two video channels are Training and “Mindset”. DEMONSTRATION videos walk through the platform and best ways to use it INSTRUCTION videos show how to do the MindFlow system And remaining videos in the Training section provide background information about what bad reading habits are and recommendations on reading essays for standardized tests.We recommend you at least watch the DEMONSTRATION videos and one of the INSTRUCTION videos before starting to practice. You can also watch all the videos once before doing practice.The Mindset channel is comprised of holistic and mindful support so you gain greater confidence, calm, and focus. These are not directly related to the practice but are instrumental in helping you perform your best. We recommend you watch all these to optimize your performance.Rewatch the videos as needed!'
    },
    {
      title: 'Is simply being aware of my bad reading habits enough to break them?',
      text:
        'Simply speaking: No. While the first step to eliminating bad habits is recognition of them, reading intentionally with greater speed and focus, helps you overcome any and all of your bad reading habits. Practice makes fast and perfect.'
    },
    {
      title: 'Are there specific techniques I can implement to get rid of my bad habits more quickly?',
      text:
        'All you need to eliminate bad reading habits are included here. Integrating MindFlow’s reading system, practice, and patience will get you there, easily and quickly!'
    },
    {
      title: 'Is it okay and normal if it’s taking a while to shift these habits?',
      text:
        'Everyone will gain the benefits of the accelerated reading system at their own pace. It typically takes 5 hours to see real improvement.'
    },
    {
      title: 'Is it okay or normal if my comprehension decreases at first as my reading speed increases?',
      text:
        'It’s more than ok-you can expect this to happen! You first need to get your eyes to move faster and if the words blur then you’re doing it right. Your ability to comprehend the ideas through the words comes later. In fact, if the words are blurred when you start, you’re doing it with. It might even feel awkward at first. If you see all the words and comprehend everything, chances are you’re not pushing yourself to read faster. One way to think about how this works is if you ever watched a tennis ball launcher machine deploying balls. They are programmed to continuously shoot balls across the net at different angles and speeds, to improve your response whether it’s your backhand, a killer ‘smash’ or ‘volley.’  Pushing yourself to read faster is similarly training your eyes to move in response to the words (and your moving finger) and over time to gain grace, ease and better comprehension.'
    },
    {
      title:
        'What’s a good baseline for words per minute (WPM) and chunking settings when you first use the Brain-Eye Coordination practice?',
      text:
        'How you program the Brain-Eye Coordination practice is a personal preference and we recommend users experiment! Words Per Minute: When you aren’t reading by moving your eyes, and instead just allow the words to ‘wash over you,’ you gain a different perspective on how your brain processes the words and their meaning. Some people prefer to see what it feels like to read faster than your regular words per minute (WPM) reading speed, and program it at a faster WPM. There is no doubt a thrill to see how much you take in and understand when it’s a lot faster than your usual reading speed! Some other people prefer to increase their speed slowly, edging up faster, instead of taking a huge leap. We recommend you try both! Chunking: Chunking words is also a personal preference in the Brain-Eye Coordination section. You can either start with smaller word sets of 2-3 words, then work up to more words, or just take a leap with a larger number set. Regardless, this process helps you to read “visually” instead of letter by letter and word by word.'
    },
    {
      title:
        'Should I practice all of the different speed reading techniques or pick one and focus on improving my reading through this one method?',
      text:
        'We recommend you focus on one technique at a time and master it, then move on to the other techniques. Once you have tried each of them, consider using the method that helps you to read faster with the best comprehension,  feels the best or results in maximum comprehension. You might find that one technique is better for reading certain subjects, so you might want to adapt your method as needed. If one technique works the best for you all the time, then stick with it.'
    },
    {
      title: 'What’s a good WPM to for my standardized test?',
      text:
        'Your goal is to read as fast as you can with the best comprehension possible. Throughout the training, you will learn to gauge how to achieve the balance between speed and comprehension as you practice. For tests to get into colleges and older, aim for 350 - 500 wpm with the best comprehension. Middle school 250 - 400 wpm. Speed Reading faster than 500 wpm is likely not necessary for your upcoming test.'
    },
    {
      title: 'In what contexts are likely exempt from my speed reading skills?',
      text:
        'You’ll also be able to apply all of MindFlow techniques to just about anything you read. What isn’t ideal to speed read includes dense material like science or material that is equation-heavy. You likely may not want to implement it for poetry, haiku or ‘owner’s manuals’. It’s most ideal for any kind of narrative and prose formats.'
    }
  ];

  return (
    <BasePage spacing="md">
      <BasePageTitle title="FAQ" paddingX="lg" paddingBottom="lg" />
      <Box w="100%" px="md">
        <Accordion allowMultiple={true} allowToggle={true}>
          {faqQuestions.map((question, index) => {
            return (
              <AccordionItem key={index}>
                <AccordionButton>
                  <Box flex="1" textAlign="left" fontWeight="bold" fontSize="lg">
                    {question.title}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>{question.text}</AccordionPanel>
              </AccordionItem>
            );
          })}
        </Accordion>
      </Box>
    </BasePage>
  );
};
