import { Box, Tooltip } from '@chakra-ui/react';
import React, { FC, useCallback, useEffect, useRef } from 'react';

import { EssayDocumentWithId } from 'types';
import { HtmlRender } from 'components/common';
import { PracticeTestConfig } from './index';

interface Props {
  testConfig: PracticeTestConfig;
  essay?: EssayDocumentWithId;

  canSelectLine: boolean;

  currentUserLine: number;
  currentTargetLine: number;

  onSelectLine: (args: { current: number }) => void;
  onTotalLinesCount: (total: number) => void;
}

export const PracticeTestText: FC<Props> = ({
  testConfig,
  essay,
  canSelectLine,
  currentUserLine,
  currentTargetLine,
  onSelectLine,
  onTotalLinesCount
}) => {
  // Elements refs
  const htmlRenderContainer = useRef<HTMLDivElement>(null);
  const htmlUserHighlightElement = useRef<HTMLDivElement>(null);
  const htmlSystemHighlightElement = useRef<HTMLDivElement>(null);

  function getWord(): HTMLParagraphElement | null {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount < 1) return null;

    const node = selection.anchorNode;
    if (!node) return null;

    // @ts-ignore
    return node.parentNode;
  }

  // get clicked span paragraph line
  function getTextLine(el: HTMLSpanElement): number | void {
    if (!el || !el.parentElement) return;

    const position = el.offsetTop;

    const style = window.getComputedStyle(el.parentElement);

    const textLineHeight = parseInt(style.getPropertyValue('line-height'));

    return Math.round(position / textLineHeight + 1);
  }

  // split paragraph in words inside span
  const splitParagraphs = useCallback(() => {
    if (!htmlRenderContainer.current) return;

    const [styleTag, textContainerTag] = htmlRenderContainer.current.children;
    const { children } = textContainerTag;

    for (let i = 0; i < children.length; i++) {
      const paragraph = children[i];
      paragraph.innerHTML = paragraph.innerHTML
        .replace(/<[^>]*>|(\S+\s*)/g, `<span>$1</span>`)
        .replace(/(&nbsp;)|\n/g, `<br />`);
    }
  }, [htmlRenderContainer]);

  function getParagraphLines(paragraphEl: any): number {
    const paragraphPosition = parseInt(paragraphEl.offsetHeight);
    const style = window.getComputedStyle(paragraphEl);
    const textLineHeight = parseInt(style.getPropertyValue('line-height'));

    return Math.floor(paragraphPosition / textLineHeight);
  }

  function getTotalParagraphsLines(): number {
    if (!htmlRenderContainer.current) return 0;

    const [styleTag, textContainerTag] = htmlRenderContainer.current.children;
    const { children } = textContainerTag;

    let totalLinesSum = 0;

    for (let i = 0; i < children.length; i++) {
      const obj = children[i];
      totalLinesSum += getParagraphLines(obj);
    }

    return totalLinesSum;
  }

  // on page load, split every paragraph inside htmlRenderContainer div
  const setupParagraphs = () => {
    splitParagraphs();

    const totalLines = getTotalParagraphsLines();
    onTotalLinesCount(totalLines);
  };
  useEffect(setupParagraphs, [splitParagraphs]);

  function highlightLine(lineIndex: number, ref: any) {
    if (!htmlRenderContainer.current) return;

    if (!lineIndex) {
      ref.current.style.height = 0;
      return null;
    }

    const [styleTag, textContainerTag] = htmlRenderContainer.current.children;
    const [paragraphEl] = textContainerTag.children;

    const style = window.getComputedStyle(paragraphEl);

    const textLineHeightInPx: string = style.getPropertyValue('line-height');
    // @ts-ignore
    const textLineHeight: number = Math.floor(Number(textLineHeightInPx.replace('px', '')));

    const total = textLineHeight * (lineIndex - 1);

    ref.current.style.top = total + 'px';
    ref.current.style.height = textLineHeightInPx;
  }

  // action of clicking paragraph
  const onClickParagraph = () => {
    if (!canSelectLine) return null;

    const wordHtmlNode = getWord();
    if (!wordHtmlNode) return;

    const clickedLineIndex = getTextLine(wordHtmlNode);
    if (!clickedLineIndex) return;

    // const incrementValue = 5; // or 10?
    // const newTargetTextLine = clickedLineIndex + incrementValue;
    highlightLine(clickedLineIndex, htmlUserHighlightElement);
    // highlightLine(newTargetTextLine, htmlSystemHighlightElement);

    onSelectLine({ current: clickedLineIndex /*, target: newTargetTextLine */ });
  };

  useEffect(() => {
    highlightLine(currentUserLine, htmlUserHighlightElement);
    highlightLine(currentTargetLine, htmlSystemHighlightElement);
  }, [currentUserLine, currentTargetLine]);

  return (
    <Box>
      <Box position="relative">
        {!canSelectLine && testConfig.numberOfColumns === 2 && (
          <Box position="absolute" top={0} bottom={0} left="50%" width="1px" bg="blue.500" borderRadius="sm" />
        )}

        {!canSelectLine && testConfig.numberOfColumns === 3 && (
          <>
            <Box position="absolute" top={0} bottom={0} left="33%" width="2px" bg="blue.500" borderRadius="sm" />
            <Box position="absolute" top={0} bottom={0} left="66%" width="2px" bg="blue.500" borderRadius="sm" />
          </>
        )}
        <Tooltip label={`Line # ${currentUserLine}`} placement="bottom" bg="green.200" color="black" fontSize="lg">
          <Box
            bg={currentUserLine ? 'rgba(115, 216, 115, 0.4)' : 'transparent'}
            position="absolute"
            ref={htmlUserHighlightElement}
            width="100%"
          />
        </Tooltip>

        <Tooltip
          label={`Next Target Line: ${currentTargetLine}th Line`}
          placement="bottom"
          bg="gray.200"
          color="black"
          fontSize="lg"
        >
          <Box position="absolute" width="100%" bg="rgba(5, 49, 74, 0.3)" ref={htmlSystemHighlightElement} />
        </Tooltip>

        <Box mb={10} onClick={onClickParagraph} ref={htmlRenderContainer}>
          <HtmlRender
            html={`
              <style>
                .htmlRender {
                  text-indent: 25px;
                  font-family: ${testConfig.fontFamily};
                  font-size: ${testConfig.fontSize}px;
                  text-align: justify;
                  color: ${canSelectLine ? '#7f7f7f' : 'black'}
                }
              </style>
              <div class='htmlRender'>
                <p>${essay?.textHtml}</p>
              </div>
            `}
          />
        </Box>
      </Box>
    </Box>
  );
};
