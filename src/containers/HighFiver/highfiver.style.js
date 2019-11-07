import styled from 'styled-components';

export const Wrapper = styled.section`
  width: 100%;
  background-image: url('/img/concentric-hex-pattern_2x.png');
  background-repeat: repeat;
  padding: 50px 0;

  h3 {
    color: #666666;
    span {
      font-weight: bold;
    }
    a {
      font-size: 1.9rem;
    }
  }
`;

export const Card = styled.div`
  background-color: #fff;
  margin: 30px auto;

  //Overriding the style guide card flexbox settings
  max-width: 80% !important;
  flex-direction: row !important;
  padding: 50px 0 !important; //temporary fix to a style guide bug

  align-items: center;

  a {
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  button {
    margin-left: 8px;
  }
`;

export const Detail = styled.div`
  padding: 1rem 3.5rem;

  p,
  li {
    color: #666666;
  }
  ul {
    list-style: disc;
    margin: 0 18px;
  }
`;

export const HighFiveListWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 20px;
`;

export const Hi5 = styled.div`
  border: 2px solid #666666;
  border-radius: 10px;
  min-width: 200px;
  padding: 5px;
  text-align: center;
  & button {
    margin-left: 0px;
  }
`;