---
title: "Online Surveys in KSDC DB and Data Discovery in ICPSR"
description: "A KSDC training video on questionnaire design, distribution and exports, and finding studies, variables and related publications in ICPSR."
lang: en
translationKey: ksdc-db-survey-and-icpsr
pubDatetime: 2026-11-20T09:00:00+09:00
sortOrder: 1
tags:
  - research-journey
  - graduate-study
  - research-methods
featured: false
draft: false
---

In “Finding Quantitative Research Data in KSDC DB”, I distinguished questions that existing data can answer from those that require a new survey. Here I follow the work that comes after that decision. Reusing data means checking the questionnaire and codebook. Collecting responses means checking the respondent's experience and the files that will later be analysed. [KSDC training video on online surveys and domestic and international data discovery](https://www.youtube.com/watch?v=ZCsriFky1Ig)

## Workflow demonstrated in the video

| Playback time   | Demonstration                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------- |
| 06:12–21:30     | Korean survey search, questionnaires, codebooks, raw data, item frequencies and recurring surveys |
| 21:34–30:14     | Viewing annual statistics from different producers                                                |
| 30:18–33:40     | Analysing an Excel file prepared by the researcher                                                |
| 33:40–1:06:11   | Registering a survey, writing questions, distribution, exports and Q&A                            |
| 1:06:29–1:32:32 | ICPSR access, study and variable search, cross-tabulation, series and related publications        |

Check the university library's database list for access to both services. The video treated institutional access to KSDC DB and activating an individual ICPSR account as separate steps. Consult the library and the study page for access and download conditions.

## From a Korean survey to its questions and responses

The video opened the 2022 Survey on Koreans' Perceptions and Values, examined its study description and questionnaire, then used E-STAT 3.0 to inspect the response distribution for a question about marriage. Reading the questionnaire first makes it possible to distinguish a question about someone's own plans from one about their general views on marriage.

Check the purpose, population and sample size in the study description, then read the questionnaire alongside the codebook. The questionnaire shows the wording and response options. The codebook explains how to find the corresponding variable in the data and what its values mean. When reading a frequency table, check whether missing or inapplicable responses are included in the denominator.

If study titles do not reveal what you need, search by questionnaire item. The video searched for items containing the Korean word for health and opened their response options. Existing items can inform a new questionnaire, provided that the original population and concept being measured fit the new research question.

### Building a frequency table for one item

The study page lists available files such as the report, questionnaire, codebook and raw data in formats such as SPSS or Excel. The video showed both downloading the SPSS file and opening E-STAT 3.0 from the study page without downloading the data first.

In E-STAT, the presenter chose **Frequency analysis**, located item 6 in the variable list and added it to the analysis. The item asked whether marriage was essential, preferable where possible or optional if a person did not want to marry. The table displayed the count and percentage for each option, with the second option selected most often in the demonstration. The presenter also generated a chart and saved both outputs in an editable document. For a report, keep the wording and response base with the percentages so readers can see what was measured.

The **Series** view helps locate recurring studies, such as the World Values Survey in the video. When comparing countries or years within a series, establish whether successive waves reinterviewed the same people or used new samples.

## Viewing two annual indicators together

The example combined Korean outbound traveller counts produced by the Korea Tourism Organization with gross national income per capita from the Bank of Korea. The presenter searched for travel and income separately, added each indicator to the selection and specified a starting year. Bringing different producers' series into one table makes comparison easier. Check the units and periods for each indicator. Similar movements over time provide limited evidence about what caused either change.

For the aggregate example, E-STAT offered descriptive statistics, correlation and regression. This differs from the earlier task of tabulating responses to an individual survey item. Establish whether a row represents a respondent or a year of aggregate observations before choosing what to calculate.

## Preparing a file for online analysis

The demonstration prepared an Excel copy with variable names in the first row and numeric values below. It used a file without formulas or extra formatting, uploaded it, checked for import errors and opened it in E-STAT. Keep a mapping from numeric codes to response labels when coding categorical answers.

The video gave `99` and `999` as examples of missing-value markers. Use a code outside the valid response range and verify that the analysis treats it as missing. For a 1–5 scale, a frequency table can reveal a `99` code before it is counted in a mean. Keep the upload file separate from the original and check whether the data may be processed by the external service.

## Registering a survey and writing questions

The demonstration registered a survey in the training area and used the resulting management page to create the questionnaire. The survey title, opening and closing dates, target group and introduction help explain what respondents are taking part in. Making the questionnaire visible and circulating the response link are separate choices. The video showed how other users could read a public questionnaire and how respondents received a separate address for submissions.

Choose question types according to what you need to measure and how the answers will be analysed. A single-choice item can ask for the main purpose of using a service. A multiple-choice item can ask which experiences apply. A matrix can use the same response scale across several items. For a scale, make clear what its endpoints and intermediate values mean. Ranking asks for relative order. For free-text answers, consider how those accounts will be read and organised during analysis.

The video also showed settings that limit repeated responses using the same identifier. When considering an email address or student number, establish why it is needed and whether it will be stored alongside responses. Review questionnaire visibility and duplicate-response checks separately.

### Question types and response conditions in the demonstration

| Type            | What the questionnaire asks for                                          | What to check in the data                                                |
| --------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Single choice   | Select one option                                                        | Mapping between each code and option                                     |
| Multiple choice | Select all foods the respondent cannot eat, with free text for **Other** | Respondent and selection counts, and where the additional text is stored |
| Matrix          | Rate Korean, Chinese and Western food on the same five-point scale       | Separate answers for each row and consistent scale direction             |
| Scale           | Choose a position between labelled endpoints                             | Direction and meaning of intermediate values                             |
| Ranking         | Place options in a preferred order                                       | How to summarise first choices and full rankings                         |
| Free text       | Enter words or sentences                                                 | Coding criteria and handling of identifying details                      |

The video described required and optional items, along with a condition that displays a follow-up only after a specified earlier response. If satisfaction is asked only of people who used a service, check both the user and non-user paths. A blank for someone who never saw the item has a different meaning from a blank for someone who skipped it.

## Checking the respondent view before distribution

Use the editor preview to check wording and sequence, then open the actual response address or QR code to inspect the respondent's path. Check whether required items block progress, whether multiple-choice instructions are clear and whether the form can be submitted on a phone. The video explains that editing is restricted once responses arrive. Use a practice survey for test submissions to keep them out of the main study data.

The researcher distributes the response address or QR code to the intended group. Registering the survey does not recruit participants automatically. Record who received the invitation and through which channel so the collected responses can be interpreted.

## Frequency tables and respondent-level data

The exported frequency table in the demonstration showed counts and percentages for each question. The raw data allowed responses to different questions to be examined together for each participant. Check the meaning of numeric option codes against the final questionnaire or codebook. Handle free text separately and examine how multiple selections are represented in the export before analysing them.

When calculating multiple-response percentages, specify whether the denominator is the number of respondents or the total number of selections.

### What to save from the results screen

The survey management page displays the response count. The results view shows tables and charts by item. The video demonstrated saving charts individually or in one download, exporting an editable frequency workbook and exporting coded records by respondent. It also showed opening the survey results in E-STAT.

A frequency table provides a starting point for a report. To compare responses across age groups, use the respondent-level file to examine the two variables together. After exporting, reconcile the number of records with the management screen and check for test submissions and the columns used for multiple selections and free text.

## Finding studies, variables and publications in ICPSR

For international data, the video used a specific query such as _voting behavior_, then narrowed the ICPSR results by criteria such as location or file format. Use the study page to check the coverage and unit of analysis, then inspect the variables, questionnaire and codebook. The series view offers another route for recurring surveys. Related publications can take readers from a dataset to a paper or help them trace the data used by a paper. Record the citation and version of the data separately from the paper.

The teaching dataset used in the demonstration draws selected items from the 2020 American National Election Study. The video cross-tabulated the candidate respondents voted for against their assessment of the president's COVID-19 response, then read row percentages. The denominator for a row percentage is the respondent group that voted for the candidate in that row. The table describes how those responses occur together. Before using the data in research, check the documented weights and analytical scope. [ICPSR teaching dataset on the 2020 US election](https://www.icpsr.umich.edu/web/ICPSR/studies/38313/)

### Connecting a study page to its files and publications

The demonstration separated study scope and methodology, downloads, **Variables** and **Data-related Publications**. **Cite This Study** gave the dataset citation. The download area distinguished questionnaires and codebooks from the raw data offered in formats such as SPSS, Stata, R or SAS, depending on the study. The related publications list shows ways the data have been used. Follow the available PDF or source link for the full text.

**Explore Data** showed a data preview and basic frequency and cross-tabulation tools. In the 2020 election example, the row variable was the candidate voted for and the column variable was the assessment of the COVID-19 response. Row percentages show how assessments were distributed within each candidate's voters. Column percentages answer how candidate choices were distributed within each assessment category. The denominator changes the question answered by the same table.

### Comparing variables across survey years

**Search/Compare Variables** searches individual questionnaire items. The video used terms about immigration and jobs, narrowed by survey period and displayed frequency tables for the 2016 and 2020 ANES items side by side. Finding similar items is the starting point. Compare the exact wording, options, samples, weights and treatment of missing responses before reporting change over time. Two distributions alone cannot show whether the same individuals changed their views.

## Survey operations addressed in the Q&A

- **Does registering a survey distribute it automatically?** The researcher sends the response address or QR code. Questionnaire visibility governs who can read the questions, so recruitment and distribution must be arranged separately.
- **Can the built-in analysis handle questions with multiple selections?** The built-in analysis had limitations at the time of the demonstration. Check how each selection is represented in the download and prepare the required tabulations accordingly.
- **Can responses be checked online and downloaded afterwards?** The demonstration showed the response count and results in the management interface, then exported item frequencies and respondent-level records separately. Choose the file that suits the intended analysis.

Whether the data come from a new survey or an archive, a results table should be traceable to the question asked, the people asked and the responses included in the calculation. Keeping the questionnaire, codebook, data version and tabulation rules together makes that path easier to check.
